import {Injectable} from '@angular/core';
import {HttpEvent, HttpHandler, HttpHeaders, HttpInterceptor, HttpRequest, HttpResponse} from "@angular/common/http";
import {HTTP} from "@ionic-native/http/ngx";
import {Platform} from "@ionic/angular";
import {from, Observable} from "rxjs";
import {environment} from "../../../../environments/environment";
import {map} from "rxjs/operators";
import {RequestResponseEncDecService} from "../../request-response-enc-dec.service";
import {cash} from "ionicons/icons";

type HttpMethod = "get" | "post" | "put" | "patch" | "head" | "delete" | "upload" | "download";

@Injectable()
export class NativeHttpInterceptorService implements HttpInterceptor {

    constructor(
        private nativeHttp: HTTP,
        private platform: Platform,
        private reqResEncDecService: RequestResponseEncDecService
    ) {
        this.platform.ready().then(() => {
            const mode = environment.production === true ? 'pinned' : 'nocheck';
            this.nativeHttp.setServerTrustMode(mode).then(() => {
                console.log('mode', mode);
            }, (error) => {
                console.log(error);
            });
        });
    }

    public intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        console.log('###### intercept');
        if (environment.dummyApp) {
            return next.handle(request);
        }

        if (!this.platform.is("cordova") || request.url.includes('/assets/')) {
            // return from(this.reqResEncDecService.encryptRequest(request, next));
            return next.handle(request);
        }

        return from(this.handleNativeRequest(request));
            // .pipe(map());
    }

    private async handleNativeRequest(request: HttpRequest<any>): Promise<HttpResponse<any>> {
        const headerKeys = request.headers.keys();
        const reqHeaders = {};
        console.log('in navtive AJX');
        headerKeys.forEach((key) => {
            reqHeaders[key] = request.headers.get(key);
        });

        try {
            await this.platform.ready();

            const method = request.method.toLowerCase() as HttpMethod;
            this.nativeHttp.setDataSerializer('json');
            let requestBody = request.body;
            if (request.body && request.body.multipart) {
                requestBody = request.body.data;
                this.nativeHttp.setDataSerializer('multipart');
            }
            const nativeHttpResponse = await this.nativeHttp.sendRequest(request.url, {
                method,
                data: requestBody,
                headers: reqHeaders
            });

            let body;

            try {
                body = JSON.parse(nativeHttpResponse.data);
            } catch (error) {
                body = {response: nativeHttpResponse.data};
            }

            const resHeaders = new HttpHeaders(nativeHttpResponse.headers);
            const response = new HttpResponse({
                body,
                status: nativeHttpResponse.status,
                headers: resHeaders,
                url: nativeHttpResponse.url,
            });
            return Promise.resolve(response);
        } catch (error) {
            if (!error.status) {
                return Promise.reject(error);
            }
            let errorMsg = "";
            try {
                errorMsg = JSON.parse(error.error);
            } catch (e) {
                errorMsg = error.error;
            }
            const response = new HttpResponse({
                body: errorMsg,
                status: error.status,
                headers: error.headers,
                url: error.url,
            });

            return Promise.reject(response);
        }
    }
}
