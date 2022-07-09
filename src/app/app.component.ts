import {Component, OnInit} from '@angular/core';
import {ExportService} from './services/export-service';
import {MenuController, NavController, Platform} from '@ionic/angular';
import {SplashScreen} from '@ionic-native/splash-screen/ngx';
import {StatusBar} from '@ionic-native/status-bar/ngx';
// import {Uid} from "@ionic-native/uid/ngx";
import {AndroidPermissions} from "@ionic-native/android-permissions/ngx";
import {DeviceDetailsService} from "./services/aps-services/device-details.service";
import {RoutingStateService} from "./services/aps-services/routing-state.service";
import {LoginService} from './login/login-service';
import {LanguageService} from './services/language-service/language.service';
import {environment} from "../environments/environment";
import {shareReplay, tap} from "rxjs/operators";
import {Observable} from "rxjs";
import {LoadingService} from "./services/aps-services/loading-service";
import {Network} from "@ionic-native/network/ngx";
import {ToastService} from "./services/aps-services/toast-service";

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  providers: [ ExportService]
})
export class AppComponent implements OnInit {
  public appPages = [];
    headerMenuItem = {};
  isEnabledRTL = false;
  screenContent$: Observable<any>;
  footerLinksOpen = false;
  showLoader: Observable<boolean>;
  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private exportService: ExportService,
    private navController: NavController,
    // private uid: Uid,
    private androidPermissions: AndroidPermissions,
    public deviceService: DeviceDetailsService,
    public routingState: RoutingStateService,
    private loginSrv: LoginService,
    private languageSrv: LanguageService,
    private menu: MenuController,
    private network: Network,
    private toastCtrl: ToastService,
    public loadingSrv: LoadingService
  ) {
    // tslint:disable-next-line:triple-equals
    this.isEnabledRTL = localStorage.getItem('isEnabledRTL') == "true";
    // console.log(JSON.stringify(exportService.export()));
    this.initializeApp();
    routingState.loadRouting();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.overlaysWebView(false);
      this.statusBar.backgroundColorByHexString('#0091D2');
      // this.splashScreen.hide();
      this.setRTL();
      // this.getImei(); src/app/Products/paypro/pages
      this.screenContent$ = this.loginSrv.screenContent$.pipe(shareReplay());
      this.watchNetwork();
    });

    this.languageSrv.setInitialAppLanguage();
    this.setAppTheme();
  }
  setRTL() {
    document.getElementsByTagName('html')[0]
            .setAttribute('dir', this.isEnabledRTL  ? 'rtl' : 'ltr');
  }

  openPage(page) {
    this.navController.navigateRoot([page.url], {});
  }

  onClickLinks(item) {
    window.open(item.link, '_system');
  }
  ionFooterMenuDidClose() {
    this.footerLinksOpen = false;
    this.menu.enable(false , 'footerLinksMenuId');
  }
  ionViewDidEnter() {
    this.menu.enable(false , 'footerLinksMenuId');
  }
  toggleFooterLinks() {
    if (!this.footerLinksOpen) {
        this.menu.enable(true, 'footerLinksMenuId');
        this.menu.open('footerLinksMenuId');
        this.footerLinksOpen = true;
    } else {
      this.footerLinksOpen = false;
    }
  }
  setAppTheme() {
    document.body.classList.add(environment.themeCategory);
  }

  private watchNetwork() {
    this.onNetworkDisconnect();
  }

  onNetworkDisconnect() {
      const disconnectSubscription = this.network.onDisconnect().subscribe(() => {
          // tslint:disable-next-line:max-line-length
          this.toastCtrl.presentToast("Network Disconnected !!", {duration: 0, position: 'top', color: 'danger'});
          this.onNetworkConnect();
          disconnectSubscription.unsubscribe();
      });
  }
  onNetworkConnect() {
      const connectSubscription = this.network.onConnect().subscribe(() => {
          this.toastCtrl.presentToast("Network Connected !", {position: 'top', color: 'tertiary'});
          this.toastCtrl.toastController.dismiss();
          this.onNetworkDisconnect();
          connectSubscription.unsubscribe();
      });
  }

  ngOnInit(): void {
    // this.showLoader = this.loadingSrv.showLoader$.pipe(tap(console.log));
  }

}
