import { Observable } from "rxjs";
import { BehaviorSubject } from "rxjs";
import { Injectable } from "@angular/core";

@Injectable({ providedIn: "root" })
export class LoadingService {
  private loaders = new Array<HTMLIonLoadingElement>();
  loaderCounter = 0;
  private _showLoader: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
      false
  );
  public showLoader$: Observable<boolean> = this._showLoader.asObservable();
  constructor() {}

  present() {
    this.loaderCounter = this.loaderCounter + 1;
    if (this.loaderCounter === 1) {
      this._showLoader.next(true);
    }
  }

  dismiss() {
    this.loaderCounter = this.loaderCounter - 1;
    if (this.loaderCounter === 0 && this._showLoader.value === true) {
      this._showLoader.next(false);
    }
  }
}
