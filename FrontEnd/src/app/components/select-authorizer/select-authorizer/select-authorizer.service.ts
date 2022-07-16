import { Injectable } from '@angular/core';
import { AngularAjaxService } from 'src/app/services/aps-services/ajaxService/angular-ajax.service';
import { SelectAuthorizerComponent } from './select-authorizer.component';
import { ModalController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class SelectAuthorizerService {

  inputData: any ;
  constructor(private ajaxSrv: AngularAjaxService, private modalController: ModalController) {
  }
  getSelectAuthorizer(data) {
    return this.ajaxSrv.sendAjaxRequest(data.getLink, data.data);
  }
  setSelectAuthorizer(data) {
    return this.ajaxSrv.sendAjaxRequest(data.setLink, data.data);
  }
}
