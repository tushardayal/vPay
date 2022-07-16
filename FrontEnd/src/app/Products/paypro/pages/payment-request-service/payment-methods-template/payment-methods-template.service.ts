import { Injectable } from "@angular/core";
import { AngularAjaxService } from "src/app/services/aps-services/ajaxService/angular-ajax.service";
import { ToastService } from "src/app/services/aps-services/toast-service";
import { map } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class PaymentMethodsTemplateService {
  CONSTANTS = {};
  constructor(private ajaxService: AngularAjaxService) {}

  getChargeTypes(data) {
    return this.ajaxService.sendAjaxRequest(data.url, data.request);
  }

  getRemittancePurpose(data) {
    return this.ajaxService.sendAjaxRequest(data.url, data.request);
  }
}
