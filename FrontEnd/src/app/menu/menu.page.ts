import {Component, OnDestroy, OnInit} from '@angular/core';
import {MenuService} from "./menu-service";
import {ExportService} from "../services/export-service";
import {ActionSheetController, AlertController, MenuController, NavController, Platform} from "@ionic/angular";
import {UserService} from "../services/aps-services/user.service";
import {BehaviorSubject, Observable, Subject} from "rxjs";
import {ObjTransferService} from '../services/aps-services/obj-transfer.service';
import {Camera, CameraOptions} from "@ionic-native/camera/ngx";
import {takeUntil} from "rxjs/operators";
import {LoginService} from '../login/login-service';
import {TranslatePipe} from '@ngx-translate/core';
import {StatusBar} from '@ionic-native/status-bar/ngx';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.page.html',
  styleUrls: ['./menu.page.scss'],
  providers: [MenuService, ExportService, TranslatePipe]
})
export class MenuPage implements OnInit, OnDestroy {

  constructor(private userService: UserService,
              private menuService: MenuService,
              private navController: NavController,
              private menuCtrl: MenuController,
              private alertCtrl: AlertController,
              private camera: Camera,
              private objTransSrv: ObjTransferService,
              private actionSheetCtrl: ActionSheetController,
              private loginSrv: LoginService,
              private platform: Platform,
              private translate: TranslatePipe,
              private statusBar: StatusBar
  ) {

    this.headerMenuItem = this.menuService.getDataForTheme(null);

    this.camOptions = {
      quality: 50,
      // destinationType: this.camera.DestinationType.FILE_URI,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      allowEdit: false, // change to false since profile pic no working
      correctOrientation: true,
      targetWidth: 100,
      targetHeight: 100,
    };

  }

  headerMenuItem = {};
  userDetails: any;
  allModules$: BehaviorSubject<any[]> = new BehaviorSubject<any[]>(null);
  showSearchBar = false;
  searchText: string;
  profileImageUrl: string;
  camOptions: CameraOptions;

  showGroupSelection$: Observable<boolean>;
  selectedGroup: any = {value: {}};
  private groupList: any[];

  destroySub$ = new Subject();

  ngOnInit() {
    this.userDetails = this.userService.getUserDetails();
    this.userService.menu$
        .subscribe((allModules: any[]) => {
          console.log('allModules', allModules);
          this.allModules$.next(allModules);
        });

    this.profileImageUrl = this.userDetails ? this.userDetails.profileImage : '';

    this.showGroupSelection$ = this.userService.showGroupSelection$;
    this.userService.avaliableGroups$
        .pipe(takeUntil(this.destroySub$))
        .subscribe((avaliableGroups: any[]) => {
          console.log('avaliableGroups', avaliableGroups);
          if (avaliableGroups && avaliableGroups.length > 0) {
            this.selectedGroup.value = this.userService.selectedGroup;
            avaliableGroups.unshift({id: "0", displayName: "Normal", text: "Normal"});
            this.groupList = this.userService.createGroupSelectionActionSheet(avaliableGroups, this.selectedGroup);
          }
        });
  }

  async showImagePicker() {
    const actionSheet = await this.actionSheetCtrl.create({
      header: this.translate.transform("lbl_set_profile_picture"),
      cssClass: '',
      buttons: [{
        text: this.translate.transform("lbl_take_a_picture"),
        icon: 'camera-outline',
        handler: () => {
          this.camOptions.sourceType = this.camera.PictureSourceType.CAMERA;
          this.takePicture();
        }
      }, {
        text: this.translate.transform("lbl_choose_from_gallery"),
        icon: 'image-outline',
        handler: () => {
          this.camOptions.sourceType = this.camera.PictureSourceType.PHOTOLIBRARY;
          this.takePicture();
        }
      }, {
         text: this.translate.transform("lbl_remove_picture"),
        icon: 'trash-outline',
        handler: () => {
          this.removeProfilePicture();
        }
      }, {
        text: this.translate.transform("lbl_cancel"),
        icon: 'close',
        role: 'cancel',
        handler: () => {
          console.log('Cancel clicked');
        }
      }]
    });
    await actionSheet.present();
  }

  takePicture() {
    this.camera.getPicture(this.camOptions).then((imageData) => {

      if (this.platform.is('ios') && this.statusBar) {
          this.statusBar.overlaysWebView(true);
          this.statusBar.overlaysWebView(false);
      }
      // If it's base64 (DATA_URL):
      // imageData is either a base64 encoded string or a file URI
      let data = imageData;
      data = data.lastIndexOf('?') > 0 ? data.substr(0, data.lastIndexOf('?')) : data;
      if (this.camOptions.destinationType === this.camera.DestinationType.DATA_URL) {
        const base64Image = 'data:image/jpeg;base64,' + imageData;
        data = {
          dataMap: {
            imageData: base64Image
          },
          filters: []
        };
      }
      this.menuService.uploadProfilePic(data).subscribe((response: any) => {
        // const response = result.response ? JSON.parse(result.response) : result;
        console.log('uploadProfilePic', JSON.stringify(response));
        this.userService.addDataInUserDetails('profileImage', response.dataMap.profileImage);
        this.profileImageUrl = response.dataMap.profileImage;
      });
    }, (err) => {
      // Handle error
      console.log('camera error' + err);
    });
  }


  openPage(page) {

    this.objTransSrv.setObjData('state', {page});
    this.navController.navigateRoot([page.url]);
    // this.router.navigate([page.url], {state: {page}});
  }

  toggleGroup(allModules: BehaviorSubject<any>, module: any) {
    if (event) {
      event.stopPropagation();
    }
    module.show = !module.show;
    if (!module.show) {
      return;
    }
    for (const module1 of allModules.getValue()) {
      if (module !== module1) {
        module1.show = false;
      }
    }
    if (module) {
      if (module.moduleName === 'ImportTrade') {
        this.loginSrv.setTradeLoginType('IMPORT');
      } else if (module.moduleName === 'ExportTrade') {
        this.loginSrv.setTradeLoginType('EXPORT');
      }
    }
    this.userService.setSelectedProduct(module.moduleName);
  }

  goToDashboard() {
    this.navController.navigateRoot(['menu/dashboard']);
    this.menuCtrl.close('mainMenuId');
  }

  goToSetting() {
    // console.log("setting");
    this.navController.navigateRoot(['menu/setting']);
    this.menuCtrl.close('mainMenuId');
  }

  async showLogoutAlert() {
    const alert = await this.alertCtrl.create({
      header: this.translate.transform("lbl_logout"),
      // subHeader: msg.generationDate,
      message: "<p class='ion-margin-top ion-no-margin'>" + this.translate.transform("are_you_sure_want_to_logout") + "</p>",
      buttons: [
        {
          text: this.translate.transform("lbl_cancel"),
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            console.log('Confirm Cancel: blah');
          }
        }, {
          text: this.translate.transform("lbl_yes"),
          handler: () => {
            console.log('Confirm Logout');
            this.logout();
          }
        }
      ]
    });
    await alert.present();
  }

  onErrorProfilePic() {
    this.profileImageUrl = 'assets/svg/defaultProfileImage.svg';
    console.log('onErrorProfilePic');
  }

  logout() {
    this.menuService.logout().subscribe(value => {
      console.log('logout');
      this.navController.navigateRoot(['/logout']);
    });
  }

  normalUser() {
    console.log('normalUser', this.selectedGroup);
    this.selectedGroup.value = {};
    this.clearGroupSelection();
  }

  clearGroupSelection() {
    for (const group of this.groupList) {
      if (group.cssClass !== "") {
        delete group.cssClass;
        break;
      }
    }
  }

  async openGroupSelection() {
    console.log('openGroupSelection');
    const actionSheet = await this.actionSheetCtrl.create({
      header: this.translate.transform("lbl_select_group"),
      cssClass: "select-listing-action-sheet",
      buttons: this.groupList,
    });
    await actionSheet.present();
    actionSheet.onWillDismiss().then(data => {
      console.log('onWillDismiss', this.selectedGroup);
      this.menuService.switchUserLogin(this.selectedGroup.value).subscribe(value => this.goToDashboard());
    });
  }

  ngOnDestroy(): void {
    this.destroySub$.next();
    this.destroySub$.complete();
  }

  /*getDisplayName(key) {
    const oldValue = key;
    key = "menu_" + key.replace(/\s/g, "_");
    key = key.toLowerCase();
    const newValue = this.translate.transform(key);
    const setValue = newValue === key ? key : newValue;
    return setValue;
  }*/

  removeProfilePicture() {
    const data = {
      dataMap: {
        profileImageRemove: "Y"
      },
      filters: []
    };
    this.menuService.uploadProfilePic(data).subscribe(response => {
      this.profileImageUrl = "assets/svg/defaultProfileImage.svg";
      this.userService.addDataInUserDetails('profileImage', this.profileImageUrl);
    });
  }
    }
