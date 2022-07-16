import {Component, OnInit} from '@angular/core';
import { NavController, MenuController, AlertController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';

import { LoginService } from './login-service';
import { ToastService } from 'src/app/services/aps-services/toast-service';
import {AndroidPermissions} from "@ionic-native/android-permissions/ngx";
import {delay, delayWhen} from "rxjs/operators";
import {interval} from "rxjs";
// import {Uid} from "@ionic-native/uid/ngx";
// import {FirebaseX} from "@ionic-native/firebase-x/ngx";

@Component({
    templateUrl: 'login.page.html',
    styleUrls: ['login.page.scss'],
    providers: []
})
export class LoginPage implements OnInit {


    data = {};
    type: string;
    broadCastMsgData;
    broadCastOpen;
    // public screenContent: any = {};
    startAjx = false;
    constructor(
        public navCtrl: NavController,
        private loginSerice: LoginService,
        private toastCtrl: ToastService,
        private route: ActivatedRoute,
        // private firebase: FirebaseX,
        // private uid: Uid,
        private androidPermissions: AndroidPermissions,
        private menu: MenuController,
        private alertController: AlertController) {
        this.type = this.route.snapshot.paramMap.get('type');
        this.loginSerice.load(loginSerice.getAllThemes()[this.type]).subscribe(d => {
            this.data = d;
        });

        /*this.firebase.getToken().then(token => {
            console.log(`The token is ${token}`);
            this.myData.token = token;
        });
        this.firebase.onMessageReceived().subscribe(data => {
            this.myData.fmsg = JSON.stringify(data);
            console.log(`FCM message: ${data}`);
        });
        this.firebase.onTokenRefresh()
            .subscribe((token: string) => {
                console.log(`Got a new token ${token}`);
            });*/
    }

    ngOnInit(): void {
        // this.loginSerice.fingerAuthAvailable().then(result => {
        //     // alert('ngOnInit LOGIN ' + JSON.stringify(result));
        //     // this.loginSerice.showFingerprintAuthPopup();
        // }, error => {
        //     console.log('fingerAuth rejected', error);
        // });
    }

    isType(item) {
        return item === parseInt(this.type, 10);
    }

    // events
    onLogin(params): void {
        this.loginSerice.basicAuthentication(params).subscribe(value => {
            if (value === true) {
               this.navCtrl.navigateRoot('authentication');
            }
        });

        // this.toastCtrl.presentToast('onLogin:' + JSON.stringify(params));
    }
    onRegister(params): void {
        this.loginSerice.activateDevice(params);
     }

    async getImei() {
        const { hasPermission } = await this.androidPermissions.checkPermission(
            this.androidPermissions.PERMISSION.READ_PHONE_STATE
        );

        if (!hasPermission) {
            const result = await this.androidPermissions.requestPermission(
                this.androidPermissions.PERMISSION.READ_PHONE_STATE
            );

            if (!result.hasPermission) {
                throw new Error('Permissions required');
            }

            // ok, a user gave us permission, we can get him identifiers after restart app
            return;
        }
        // this.myData = this.uid;
        // return this.uid.IMEI;
    }
    ionMenuDidClose() {
        this.broadCastOpen = false;
    }
    toggleMenu() {
        if (!this.broadCastOpen) {
            this.menu.enable(true, 'broadcastMenuId');
            this.menu.open('broadcastMenuId');
            this.broadCastOpen = true;
        } else {
            this.menu.enable(true, 'broadcastMenuId');
            this.menu.close('broadcastMenuId');
            this.broadCastOpen = false;
        }
    }
    ionViewDidEnter() {

        this.loginSerice.startAjaxCalls.subscribe((startAjaxs) => {
            if (startAjaxs) {
                this.getOfflineBroadcastMessages();
                this.loginSerice.getScreenContent();
            }
        });

        this.menu.enable(false , 'broadcastMenuId');
    }
    async viewBroadcastMsg(item) {
        const alert = await this.alertController.create({
            header: item.briefMessage,
            message: item.messageDescription,
            buttons: ['OK']
        });
        await alert.present();
    }

    getOfflineBroadcastMessages() {
        this.loginSerice.getOfflineBroadcastMessages().subscribe((response) => {
            this.broadCastMsgData = response;
        });
    }
}
