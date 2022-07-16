import {TouchID} from '@ionic-native/touch-id/ngx';
import {CUSTOM_ELEMENTS_SCHEMA, Injectable, NgModule} from '@angular/core';
import {BrowserModule, HAMMER_GESTURE_CONFIG} from '@angular/platform-browser';
import {RouteReuseStrategy} from '@angular/router';

import {IonicModule, IonicRouteStrategy} from '@ionic/angular';
import {SplashScreen} from '@ionic-native/splash-screen/ngx';
import {StatusBar} from '@ionic-native/status-bar/ngx';

import {AppComponent} from './app.component';
import {AppRoutingModule} from './app-routing.module';
import {ToastService} from './services/aps-services/toast-service';
import {LoadingService} from './services/aps-services/loading-service';

import {HTTP_INTERCEPTORS, HttpBackend, HttpClient, HttpClientModule} from '@angular/common/http';

import {BarcodeScanner} from '@ionic-native/barcode-scanner/ngx';

import {IonicStorageModule } from '@ionic/storage-angular';
import {SuperTabsModule} from "@ionic-super-tabs/angular";
import {IonicGestureConfigService} from "./services/aps-services/ionic-gesture-config.service";
import {AndroidPermissions} from "@ionic-native/android-permissions/ngx";
// import { Uid } from '@ionic-native/uid/ngx';
// import {FirebaseX} from "@ionic-native/firebase-x/ngx";
import {DatePipe} from "@angular/common";
import {MissingTranslationHandler, MissingTranslationHandlerParams, TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import {Camera} from "@ionic-native/camera/ngx";
import {HTTP} from "@ionic-native/http/ngx";
import {NativeHttpInterceptorService} from "./services/aps-services/ajaxService/native-http-interceptor.service";
import {Device} from '@ionic-native/device/ngx';
import {FileTransfer} from '@ionic-native/file-transfer/ngx';
import {File} from '@ionic-native/file/ngx';
import {FileOpener} from '@ionic-native/file-opener/ngx';
import {Market} from '@ionic-native/market/ngx';
import {AppVersion} from '@ionic-native/app-version/ngx';
import {AndroidFingerprintAuth} from '@ionic-native/android-fingerprint-auth/ngx';
import {RequestResponseEncDecService} from "./services/request-response-enc-dec.service";
import {FingerprintAIO} from "@ionic-native/fingerprint-aio/ngx";
import {Network} from "@ionic-native/network/ngx";

// import { AngularFireModule } from "@angular/fire";

@Injectable({providedIn: 'root'})
export class HttpClientTrans extends HttpClient {
    constructor(handler: HttpBackend) {
        super(handler);
    }
}
export function createTranslateLoader(http: HttpClientTrans) {
    return new TranslateHttpLoader(http, '../assets/i18n/', '.json');
}

export class MyMissingTranslationHandler implements MissingTranslationHandler {
    handle(params: MissingTranslationHandlerParams) {
        return params.key;
    }
}

const interceptorProviders = [
    { provide: HTTP_INTERCEPTORS, useClass: RequestResponseEncDecService, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: NativeHttpInterceptorService, multi: true },
];
@NgModule({
    declarations: [AppComponent],
    entryComponents: [],
    imports: [
        // AngularFireModule.initializeApp(AppSettings.FIREBASE_CONFIG),
        BrowserModule, HttpClientModule,
        IonicModule.forRoot(),
        IonicStorageModule.forRoot(),
        SuperTabsModule.forRoot(),
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: (createTranslateLoader),
                deps: [HttpClientTrans]
            },
            missingTranslationHandler: { provide: MissingTranslationHandler, useClass: MyMissingTranslationHandler },
            useDefaultLang: true
        }),
        AppRoutingModule
    ],
    providers: [
        StatusBar, BarcodeScanner,
        TouchID,
        // Uid,
        SplashScreen, AndroidPermissions, ToastService, LoadingService,
        // FirebaseX,
        Network,
        DatePipe,
        Camera,
        Device,
        HTTP,
        {provide: RouteReuseStrategy, useClass: IonicRouteStrategy},
        interceptorProviders,
        {provide: HAMMER_GESTURE_CONFIG, useClass: IonicGestureConfigService},
        FileTransfer, File,
         FileOpener,
         Market,
         AppVersion,
        FingerprintAIO,
         AndroidFingerprintAuth
    ],
    bootstrap: [AppComponent],
    exports: [

    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule {}