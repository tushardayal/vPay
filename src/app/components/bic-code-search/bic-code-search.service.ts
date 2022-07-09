import { Injectable } from "@angular/core";
import { AngularAjaxService } from "src/app/services/aps-services/ajaxService/angular-ajax.service";

@Injectable({
  providedIn: "root",
})
export class BicCodeSearchService {
  private bicCodeType;
  private CONSTANTS = {
    SEARCH_BICCODE: "commons/searchService/private/getBicCodeDetails",
  };
  constructor(private ajaxSrv: AngularAjaxService) {}
  getBicCodeType() {
    return this.bicCodeType;
  }
  setBicCodeType(type) {
    this.bicCodeType = type;
  }
  searchBicCode(filters) {
    // if(APP_CONSTANTS.BICCODE_VAlUE_MANUPULATION){
    //   /*if(BicCodeService.getBicCodeType()==='EP5'){
    //     filters.push({
    //       name : "bicCodeEp5",
    //       value : "____LK",
    //       type : "String"
    //     });
    //   }else */if(BicCodeService.getBicCodeType()==='EP3'){
    //     filters.push({
    //       name : "bicCodeEp3",
    //       value : "____LK",
    //       type : "String"
    //     });
    //     BicCodeService.setBicCodeType('EP5')
    //     BicCodeService.setReverse(true);
    //   }
    // }
    filters.push({
      name: "recordType",
      value: this.getBicCodeType(),
      type: "String",
    });

    const data = {
      searchType: "BICCODESEARCH",
      filters,
    };
    return this.ajaxSrv.sendAjaxRequest(this.CONSTANTS.SEARCH_BICCODE, data);
  }
}
