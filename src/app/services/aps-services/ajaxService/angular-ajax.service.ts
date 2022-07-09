import {BadInput} from './bad-input';
import {NotFoundError} from './not-found-error';
import {AppError} from './app-error';
import {Injectable} from '@angular/core';
import {from, throwError} from 'rxjs';
import {HttpClient, HttpHeaders, HttpResponse} from '@angular/common/http';
import {catchError, concatMap, finalize, map} from 'rxjs/operators';
import {ToastService} from "../toast-service";
import {environment} from "../../../../environments/environment";
import {UserService} from "../user.service";
import {AlertController, Platform} from "@ionic/angular";
import {HTTP} from "@ionic-native/http/ngx";
import {FileTransfer, FileTransferObject, FileUploadOptions} from "@ionic-native/file-transfer/ngx";
import {Router} from "@angular/router";
import {File} from '@ionic-native/file/ngx';
import {AndroidPermissions} from '@ionic-native/android-permissions/ngx';
import {FileOpener} from '@ionic-native/file-opener/ngx';
import {LoadingService} from "../loading-service";
import {RequestResponseEncDecService} from "../../request-response-enc-dec.service";

@Injectable({providedIn: 'root'})
export class AngularAjaxService {

  static ajxCounter = 0;
  securityId: string;
  loader: any;
  private showRetryAlert = false;
  origin = environment.apiUrl.split("/cashProServiceAPI")[0];
  constructor(public httpClient: HttpClient,
              private httpNative: HTTP,
              private toastCtrl: ToastService,
              private userService: UserService,
              private router: Router,
              private platform: Platform,
              private transfer: FileTransfer,
              private file: File,
              private alertCtrl: AlertController,
              private androidPermissions: AndroidPermissions,
              private loadingService: LoadingService,
              private reqResEncDec: RequestResponseEncDecService,
              private fileOpener: FileOpener) {
    console.log('AngularAjaxService constructor ');
    this.userService.securityId$.subscribe(value => {
      console.log('securityId$ ', value);
      this.securityId = value;
    });
  }

  public get(url: string, params?: any, options: any = {}) {
    /*options.params = params;
    options.withCredentials = true;*/
    return this.httpClient.get(url, options);
  }

  public sendAjaxRequest(reqURL: string, data: any, method = 'POST', showLoader = true) {
    if (showLoader) {
        this.loadingService.present();
    }
    AngularAjaxService.ajxCounter++;
    let url = environment.apiUrl + reqURL;
    if (environment.dummyApp) {
      url = environment.dummyUrl + reqURL;
      url = url + '.json';
      method = 'GET';
    }
    /*if (this.platform.is('cordova')) {
      console.log("sendRequest ", reqURL, data);
    }*/
    let headers = new HttpHeaders();
    headers = headers.set('Content-Type', 'application/json');
    if (this.securityId) {
      // headers = headers.set('securityId', this.securityId);
      headers = headers.set('paramter1', this.securityId);
    }
    headers = headers.set('Access-Control-Allow-Origin', this.origin);
    data.requestId = AngularAjaxService.ajxCounter + "_" + Date.now().toString(); // Added For session replay attak
    console.log("sendRequest ", reqURL, data);
    console.log('%cajxCounter ' + AngularAjaxService.ajxCounter, 'color:yellow');
    const httpOptions = {headers, body: data};
    return this.httpClient.request(method, url, httpOptions)
          .pipe(map((response) => {
                /*if (this.platform.is('cordova')) {
                  console.log("response ", reqURL, response);
                }*/
                console.log("response ", response);
                return this.massageReponse(response, showLoader);
              }),
              catchError((error) => {
                return this.handleError(error);
              }),
              finalize(() => {
                  if (showLoader) {
                      this.loadingService.dismiss();
                  }
              })); // hide(this.loader)
  }
    public uploadFileToServer(reqURL: string, fileData: any, entityKey, method = 'POST', showLoader = true) {
        if (showLoader) {
            this.loadingService.present();
        }
        let url = environment.apiUrl + reqURL;
        if (environment.dummyApp) {
            url = environment.dummyUrl + reqURL;
            url = url + '.json';
            method = 'GET';
        }

        const data = new FormData();
        data.append('entityKey', entityKey);
        data.append('uploadedFile', fileData);
        let headers = new HttpHeaders();
        // headers = headers.set('Content-Type', 'multipart/form-data');

        if (this.securityId) {
            // headers = headers.set('securityId', this.securityId);
            headers = headers.set('paramter1', this.securityId);
        }
        headers = headers.set('Access-Control-Allow-Origin', this.origin);
        let httpOptions;
        if (this.platform.is("cordova")) {
            httpOptions = {headers, body: {data, multipart: true}};
        } else {
            httpOptions = {headers, body: data};
        }
        return this.httpClient.request(method, url, httpOptions)
            .pipe(
                map((response) => {
                    return this.massageReponse(response, showLoader);
                }),
                catchError(this.handleError),
                finalize(() => {
                    if (showLoader) {
                        this.loadingService.dismiss();
                    }
                }));
    }

    public downloadFile(downloadUrl, fileName, postURL?, postData?) {
      downloadUrl = environment.apiUrl + downloadUrl;
      let DOWNLOAD_URL_POST = "BaseService/private/postDownload";
      if (postURL) {
        DOWNLOAD_URL_POST = postURL;
      }

      let data = {dataMap : {}};
      if (postData) {
        data = postData;
      }

      this.sendAjaxRequest(DOWNLOAD_URL_POST , data).subscribe(response => {
        console.log("downloaded succefully");
        if (this.platform.is('cordova')) {
          this.downloadForNative(downloadUrl, fileName);
        } else {
          window.open(downloadUrl, '_blank');
        }
      });
    }

  private async downloadForNative(url, fileName) {
      const fileTransfer: FileTransferObject = this.transfer.create();
      /*
      * encodeURI(url);
      * removing encodeURI as it double encoding file as per below file name
      * "UAT Test Links.txt" converting to UAT%2520Test%2520Links.txt expected is UAT%20Test%20Links.txt
      */
      const uri = url;
      const path = await this.getDownloadPath();
      fileTransfer.onProgress((progress) => console.log(progress));
      fileTransfer.download(uri, path + fileName)
          .then(
              result => {
                  console.log('download complete: ' + result.toURL());
                  this.toastCtrl.presentToast('donwload - ' + fileName);
                  const fileNamePath = result.toURL(); // path + fileName;
                  this.openFile(fileNamePath, result.type);
              },
              error => {
                  console.log(error);
                  this.toastCtrl.presentToast('error - ' + fileName);
              }
          );
    }

    openFile(fileNamePath , fileType) {
        this.fileOpener.open(fileNamePath, fileType)
            .then(() => console.log('File is opened'))
            .catch(e => console.log('Error opening file', e));
    }

// will used for profile pic upload where we will have File URI and DONT have fileData object
    public uploadForNative(url, fileURI) {
        const fileTransfer: FileTransferObject = this.transfer.create();
        const keyCode = Math.floor(Math.random() * (15 - 1 + 1)) + 1;
        const keyFetch = "Key_" + keyCode;
        const options: FileUploadOptions = {
            fileKey: 'uploadedFile',
            fileName: fileURI.substr(fileURI.lastIndexOf('/') + 1),
            headers: {securityId: this.securityId, keyRefPointer: keyFetch}
        };
        url = encodeURI(environment.apiUrl + url);

        const permission$ = from(this.getPermission());
        const fupload$ = from(fileTransfer.upload(fileURI, url, options).then(
            async result => {
                const resHeaders = new HttpHeaders(result.headers);
                const response = new HttpResponse({
                    body: result.response,
                    // status: result.status,
                    headers: resHeaders,
                    url,
                });
                const res = await this.reqResEncDec.decryptResponse(response);
                console.log('uploaded complete', res);
                console.log('uploaded complete', JSON.stringify(result.response));
                this.toastCtrl.presentToast('File Uploaded Successfully');
                return result;
            },
            error => {
                console.log(error);
                this.toastCtrl.presentToast('error - ' + error);
                return error;
            },
        ));
        return permission$.pipe(concatMap(() => fupload$));
    }

        // return permission$.
            /*.pipe(catchError(err => {
                this.toastCtrl.presentToast('Unable to upload ' + err);
                console.log(err);
                return err;
            }));*/

            /*.then(
                result => {
                    console.log('uploaded complete', JSON.stringify(result.response));
                    this.toastCtrl.presentToast('uploaded - ' + fileURI);
                },
                error => {
                    console.log(error);
                    this.toastCtrl.presentToast('error - ' + fileURI);
                },
            );*/
    // }

    private async getPermission() {
        await this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE)
            .then(
                result => {
                    if (!result.hasPermission) {
                        return this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE);
                    }
                }
            );
    }

    async getDownloadPath() {
        if (this.platform.is('ios')) {
            return this.file.documentsDirectory;
        }
        await this.getPermission();
        return this.file.externalRootDirectory + "/Download/";
    }

    private massageReponse(response, showLoader) {
        // console.log('massageReponse ', response);
        if (response.responseStatus.status === "0") {
            return response; // success_callback(response.data);
        } else if (response.responseStatus.status === "4") {
            return response; // warning_callback(response.data);
        } else if (response.responseStatus.status === "5") {
            return response; // info_callback(response.data);
        } else if (response.responseStatus.status === "1") {
            this.toastCtrl.presentToast(response.responseStatus.message);
            if (response.responseStatus.errorList && response.responseStatus.errorList.length !== 0) {
                this.toastCtrl.presentToast(response.responseStatus.errorList[0]);
            }
            throw new AppError(response.responseStatus);
        } else {
            if (response.responseStatus.message === 'MSG_KEY_SESSION_INVALIDATE') {
                console.log('redirect to login');
                this.router.navigateByUrl('/logout');
            } else {
                this.toastCtrl.presentToast(response.responseStatus.message);
                throw new AppError(response.responseStatus);
            }
        }
        return response;
    }

  private handleError(error: Response) {
    console.log("handled...", JSON.stringify(error));
    if (!(error instanceof AppError)) {
        if ((this.router.url.indexOf('login') > -1) && this.showRetryAlert === false) {
            this.showRetry();
            this.showRetryAlert = true;
            return throwError(error);
        }
        this.toastCtrl.presentToast("Couldn't connect to server");
    }
    if (error.status === 400) {
      return throwError(new BadInput(error.json()));
    }
    if (error.status === 404) {
        return throwError(new NotFoundError());
    }
    return throwError(error);
  }

    private async showRetry() {
        const alert = await this.alertCtrl.create({
            header: "Error",
            message: "<p class='ion-margin-top ion-no-margin'>Couldn't connect to server</p>",
            backdropDismiss: false,
            buttons: [{
                text: "Retry"
            }]
        });
        await alert.present();
        alert.onDidDismiss().then(() => {
            this.showRetryAlert = false;
            // reload
            // @ts-ignore
            window.location = "";
            /*this.router.navigateByUrl('/AD', {skipLocationChange: true}).then(() =>
                this.router.navigate([this.router.url]));*/
        });
    }
}
