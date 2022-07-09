import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { LoadingService } from './loading-service';

@Injectable({ providedIn: 'root' })
export class IntroService {

    constructor( private loadingService: LoadingService) {}

    // Set data for - WIZARD MAIN
    getData = (): any => {
        return {
           backgroundImage: "assets/imgs/background/39.jpg",
           btnPrev: "Previous",
           btnNext: "Next",
           btnFinish: "Finish",
           items: [
               {
                  avatarImage: "assets/imgs/color-images/9.png",
                   //logo: "assets/imgs/logo/2.png",
                   title: "Aenean feugiat ipsum eget porttitor auctor",
                   // tslint:disable-next-line:max-line-length
                   description: "Duis gravida, tellus eget condimentum vestibulum, massa metus gravida mauris, elementum sodales nunc tellus ut ligula"
               },
               {
                  avatarImage: "assets/imgs/color-images/10.png",
                   //logo: "assets/imgs/logo/2.png",
                   title: "Sed sollicitudin tortor id bibendum sollicitudin",
                   description: "Donec tincidunt odio eget ante bibendum, eget dapibus mauris hendrerit"
               },
               {
                  avatarImage: "assets/imgs/color-images/11.png",
                   //logo: "assets/imgs/logo/2.png",
                   title: "In ac tortor in risus commodo molestie",
                   description: "Ut iaculis scelerisque mauris sit amet interdum"
               }
           ]
        };
    }

    load(): Observable<any> {
        const that = this;
        // that.loadingService.show();
        return new Observable(observer => {
                // that.loadingService.hide();
                observer.next(this.getData());
                observer.complete();
            });
        }
}
