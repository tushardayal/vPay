import { TranslateService } from '@ngx-translate/core';
import { Observable, of } from "rxjs";
import { ToastService } from "src/app/services/aps-services/toast-service";
import { Injectable, Self } from "@angular/core";
import { Directive, ElementRef } from "@angular/core";
import {
  AbstractControl,
  NgControl,
  ValidationErrors
} from "@angular/forms";
import { ApsTraslatePipe } from '../components/pipes/aps-traslate.pipe';
@Injectable({
  providedIn:'root'
})
export class InputFieldValidationService {
  private reg = /^[^<>;']*$/;
  private errorMsg = "specific sensitive words are not allowed";
  private filterStrings = ["&lt;","&gt;","&#40;","&#41;","&#35;","&amp;","&quot;","<script>","</script>"," or='","&lt;script&gt;","&lt;/script&gt;","alert","&lt;script>","r<script&gt;","</script&gt;","&lt;/script>","'",";","--","select ","update ","delete ","drop ",">","<",];
  private reg1 = new RegExp(this.filterStrings.join("|"), "i");
  constructor(
    private translate : TranslateService,
    private toastSrv: ToastService
    ){
     translate.get('i_server_specific_sensitive_words_are_not_allowed').subscribe(val =>{
      this.errorMsg = val;
    });
  }
  validateInput(text: string): null | boolean {
      if (text) {
          if (text.match(this.reg) && !this.reg1.test(text)) {
              return null;
          } else {
              this.toastSrv.presentToast(this.errorMsg);
              return true;
          }
      }
      return null;
  }
}
@Directive({
  // tslint:disable-next-line:directive-selector
  selector: "ion-input[ngModel], ion-input[formControlName], ion-textarea[ngModel], ion-textarea[formControlName], .alert-input",
})
export class InputFieldValidationDirective {
 
  el: any;
  
  constructor(
    private elementRef: ElementRef,
    @Self() private control: NgControl,
    private validateSrv: InputFieldValidationService 
  ) {
    this.el = this.elementRef.nativeElement;
    }
  ngOnInit(): void {
    if(this.control.control)
    this.control.control.setAsyncValidators(
      (validateControl: AbstractControl): Observable<ValidationErrors | null> => {
        if(typeof validateControl.value != 'string' ){
          return of(null);
        }
        const text =validateControl.value;
        const errorMsg = this.validateSrv.validateInput(text); 
        if (errorMsg) {
          return of({ corsError: true });
        } else {
          return of(null);
        }
      }
    );
    // this.control.valueChanges.pipe(takeUntil(this.unsub$)).subscribe((val) => {
    //   this.control.control.setAsyncValidators(
    //     (validateControl: AbstractControl): Observable<ValidationErrors | null> => {
    //       if(typeof validateControl.value != 'string'){
    //         return of(null);
    //       }
    //       const text =validateControl.value;
    //       const controlErrors = this.control.errors;
    //       if (controlErrors) {
    //         console.log(controlErrors);
    //       }
    //       if (text.match(this.reg) && !this.reg1.test(text)) {
    //         return of(null);
    //       } else {
    //         this.tost.presentToast(this.errorMsg);
    //         return of({ corsError: true });
    //       }
    //     }
    //   );
    // });
  }
}
