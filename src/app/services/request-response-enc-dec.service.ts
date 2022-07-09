import {Injectable} from '@angular/core';
import {appConstants} from "../appConstants";
import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse} from "@angular/common/http";
import {from, Observable} from "rxjs";
import {mergeMap, switchMap} from "rxjs/operators";
import {AESEncryptDecryptService} from "./aes-encrypt-decrypt-service";


declare function generateAESKey(keyLength: number);
declare function RSA_encrypt(refPointer, data, callback);
declare function RSA_decrypt(refPointer, data, callback);
declare function doEncryption(aeskey, plaintext);
declare function doDecryption(aeskey, plaintext);
declare function setPrivateKeyMap(privateKeyMap: any);
@Injectable({
    providedIn: 'root'
})
export class RequestResponseEncDecService implements HttpInterceptor {
    private aesKey;

    constructor() {}

    getType(object) {
        const stringConstructor = "test".constructor;
        const arrayConstructor = [].constructor;
        const objectConstructor = {}.constructor;
        if (object === null) {
            return "null";
        } else if (object === undefined) {
            return "undefined";
        } else if (object.constructor === stringConstructor) {
            return "String";
        } else if (object.constructor === arrayConstructor) {
            return "Array";
        } else if (object.constructor === objectConstructor) {
            return "Object";
        } else {
            return "don't know";
        }
    }

    millisToMinutesAndSeconds(millis) {
        // var minutes = Math.floor(millis / 60000);
        const seconds = ((millis % 60000) / 1000);
        return (seconds < 10 ? '0' : '') + seconds;
    }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // console.log('@#RequestResponseEncDecService', );
        return from(this.encryptRequest(req, next))
            .pipe(
                switchMap(request => {
                    // console.log("switchMap", request);
                    return next.handle(request)
                        .pipe(
                            mergeMap(async (event: HttpEvent<any>) => {
                                if (event instanceof HttpResponse) {
                                    const _body = await this.decryptResponse(event);
                                    return event.clone({ body: _body });
                                }
                            }),
                        );
                }),
            );
    }
    async encryptRequest(req: HttpRequest<any>, next: HttpHandler): Promise<HttpRequest<any>> {

        if (!req.body || !appConstants.IS_ENCRYPTION_REQUIRED) {
            return Promise.resolve(req);
            // return next.handle(req);
        }
        this.aesKey = generateAESKey(32);
        const startTime = new Date().getTime();
        let requestData = req.body;
        if (req.body.multipart) {
            return Promise.resolve(req);
        }
        if (this.getType(requestData) !== "String") {
            if (JSON.stringify(requestData) !== "{}") {
                requestData = JSON.stringify(requestData);
            } else {
                return Promise.resolve(req);
               // return  next.handle(req);
            }
        }
        const encryptedData = doEncryption(this.aesKey, requestData);

        if (encryptedData === "") {
            // return next.handle(req);
            // return Promise.resolve(req);
        }
        const keyCode = Math.floor(Math.random() * (15 - 1 + 1)) + 1;
        let keyFetch = "Key_" + keyCode;
        /*return RSA_encrypt(keyFetch, this.aesKey, (d) => {
            const data = {id: d, dataToBeSent: encryptedData};
            req.headers.append('keyRefPointer', keyFetch);
            // req.body.data = data;
            req = req.clone({body: data});
            const endTime = new Date().getTime();
            const totalTime = endTime - startTime;
            return next.handle(req);
        });*/

        return new Promise((resolve, reject) => {
            RSA_encrypt(keyFetch, this.aesKey, (d) => {
                const data = {id: d, dataToBeSent: encryptedData};

                const headerKeys = req.headers.keys();
                req = req.clone({headers: req.headers.set('keyRefPointer', keyFetch)});
                req = req.clone({body: data});
                const endTime = new Date().getTime();
                // return next.handle(req);
                const totalTime = endTime - startTime;
                return resolve(req);
                // return req;
            });
        });


        // return Promise.(req);
    }

    decryptResponse(event: HttpEvent<any>): Promise<HttpEvent<any>> {
        if (event instanceof HttpResponse) {
            if (!appConstants.IS_ENCRYPTION_REQUIRED && event.url.indexOf('/isEncryptionRequired') === -1) {
                return Promise.resolve(event.body);
                // return event;
            }
            if (event.url.includes('/isEncryptionRequired') && event.body.pvtKeysMap) {
                const pvtkeyMap = doDecryption(event.body.pvtKeysMap, AESEncryptDecryptService.secretKey);
                setPrivateKeyMap(JSON.parse(pvtkeyMap));
            }

            let keyRefHeader = event.headers.get('keyrefpointer');
            if (!keyRefHeader) {
                return Promise.resolve(event.body);
                // return event;
            }
            keyRefHeader = keyRefHeader.replace('PARAM', 'PRIVATE');
            const startTime = new Date().getTime();
            // var refPointer = keyRefHeader;
            // var deferred = $q.defer();
            // console.log(response);
            return new Promise((resolve, reject) => {
                RSA_decrypt(event.body.encKey, keyRefHeader, (responseData) => {
                    const decryptedData = doDecryption(event.body.encData, responseData);
                    const lastIndex = decryptedData.lastIndexOf("}");
                    const data = JSON.parse(decryptedData.substring(0, lastIndex + 1));
                    // console.log('responseData ', data);
                    const endTime = new Date().getTime();
                    const totalTime = endTime - startTime;
                    event.clone({body: data});
                    resolve(data);
                });
            });
        } else {
            return Promise.resolve(event);
        }
    }
}
