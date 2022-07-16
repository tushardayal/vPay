import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActionSheetController, NavController} from "@ionic/angular";
import {LoginService} from "../login-service";
import {UserService} from "../../services/aps-services/user.service";
import {Observable, Subject, BehaviorSubject} from "rxjs";
import {map, takeUntil} from "rxjs/operators";
import {AESEncryptDecryptService} from "../../services/aes-encrypt-decrypt-service";
import {environment} from "../../../environments/environment";

@Component({
  selector: 'app-authentication',
  templateUrl: './authentication.page.html',
  styleUrls: ['./authentication.page.scss'],
})
export class AuthenticationPage implements OnInit, OnDestroy {

  numericPattern = '^[0-9]*$';
  otp: any = "";
  showGroupSelection$: Observable<boolean>;
  authType$: Observable<any>;
  avaliableAuthTypes = {SOFTTOKEN: 'SOFTTOKEN', HARDTOKEN: 'HARDTOKEN', SOFTANDHARDTOKEN: 'SOFTANDHARDTOKEN', WEBTOKEN: 'WEBTOKEN'};

  selectedGroup: any = {value: {}};
  selectedAuthType: any = {};
  private groupList: any[];

  resendOTPTImer: Observable<any>;
  destroySub$ = new Subject();
  isSubmit: Observable<boolean>;
    environment = environment;

  constructor(private navCtrl: NavController,
              private loginService: LoginService,
              private userService: UserService,
              private aesService: AESEncryptDecryptService,
              private actionSheetCtrl: ActionSheetController) { }

  ngOnInit() {
      this.resendOTPTImer = this.loginService.resendOTPTImer$;
      this.isSubmit = this.loginService.disableLoginClick$;
      this.authType$ = this.userService.authType$
        .pipe(
            takeUntil(this.destroySub$),
            map((values: any[]) => {
              if (values && values.length === 1 && values[0] === this.avaliableAuthTypes.SOFTTOKEN) {
                this.selectedAuthType = this.avaliableAuthTypes.SOFTTOKEN;
                this.generateOTP();
              }
              return values;
            }));
      this.showGroupSelection$ = this.userService.showGroupSelection$;
      this.userService.avaliableGroups$
        .pipe(takeUntil(this.destroySub$))
        .subscribe((avaliableGroups: any[]) => {
          console.log('avaliableGroups', avaliableGroups);
          if (avaliableGroups && avaliableGroups.length > 0) {
            this.groupList = this.userService.createGroupSelectionActionSheet(avaliableGroups, this.selectedGroup);
          }
        });
  }

  generateOTP() {
    this.loginService.generateOTP();
  }
  login() {
    const otp = this.aesService.encrypt(this.otp + "");
    this.loginService.validateToken({password: otp, authType: this.selectedAuthType})
        .pipe(takeUntil(this.destroySub$))
        .subscribe(value => {
          this.loginService.loginAsNormalOrGroupUser(this.selectedGroup.value).subscribe(response => {
            this.navCtrl.navigateRoot('menu/dashboard');
          });
        });
  }

  normalUser() {
    console.log('normalUser', this.selectedGroup);
    this.resetForm();
  }

  clearGroupSelection() {
    for (const group of this.groupList) {
      if (group.cssClass !== "") {
        delete group.cssClass;
        break;
      }
    }
  }

  async showGroupSelection() {
      const actionSheet = await this.actionSheetCtrl.create({
        header: 'Select Group',
        cssClass: "select-listing-action-sheet",
        buttons: this.groupList,
      });
      await actionSheet.present();
      actionSheet.onWillDismiss().then(data => {
        console.log('onWillDismiss', this.selectedGroup);
      });
  }

  selectAuthType(authType) {
    this.selectedAuthType = authType;
  }

  ngOnDestroy(): void {
    this.destroySub$.next();
    this.destroySub$.complete();
    this.loginService.disableLoginClick$.next(false);
  }

  resetForm() {
    this.otp = undefined;
    if (this.selectedGroup.value.id) {
      this.selectedGroup.value = {};
      this.clearGroupSelection();
    }
  }
}
