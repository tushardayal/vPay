import { Component, OnInit, Output, EventEmitter } from "@angular/core";
import { BicCodeSearchService } from "./bic-code-search.service";
import { MenuController } from '@ionic/angular';
import { pipe, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: "app-bic-code-search",
  templateUrl: "./bic-code-search.component.html",
  styleUrls: ["./bic-code-search.component.scss"],
  providers: [TranslatePipe]
})
export class BicCodeSearchComponent implements OnInit {
  // tslint:disable-next-line: no-output-on-prefix
  @Output() onSelectBicCode = new EventEmitter<any>();
  bankname;
  constructor(private bicCodeSrv: BicCodeSearchService, private menuCtrl: MenuController,
    private translate: TranslatePipe
  ) { }
  bicCodeToggle = false;
  selectedFilters = [];
  criteriaDetails = {
    bicCode: undefined,
    bankName: undefined,
    city: undefined,
    country: undefined,
    routingCode: undefined,
    branchName: undefined,
  };
  isSelectedRecordInvalid = false;
  bicCodeSearchResponseMap = [];
  filters = [];
  isDataSearched = true;
  ngOnInit() {}
  removeFilters(index) {
    this.filters.splice(index, 1);
  }
  editFilters() {
    this.bicCodeToggle = false;
  }
  getValue(value) {
    if (value.indexOf('-') === 0) {
      return null;
    }
    return value;
  }
  selectBicCode(item) {
    let routingCode = 1;
    const bankDetails = item;

    if (this.bicCodeSrv.getBicCodeType() === "EP3") {
      const val = this.getValue(bankDetails.routingCode);

      if (val != null) {
        routingCode = val.indexOf("BANKAE");
      }
    }
    // tslint:disable-next-line: forin
    for (let i in bankDetails) {
      bankDetails[i] = this.getValue(bankDetails[i]);
    }
    if (routingCode === 0) {
      this.isSelectedRecordInvalid = true;
    } else {
      this.isSelectedRecordInvalid = false;
      this.onSelectBicCode.emit({...bankDetails});
      this.menuCtrl.close("bicCodeMenuId");
    }
  }
  isFieldsEmpty() {
    if (
      !this.criteriaDetails.bankName &&
      !this.criteriaDetails.bicCode &&
      !this.criteriaDetails.branchName &&
      !this.criteriaDetails.city &&
      !this.criteriaDetails.country &&
      !this.criteriaDetails.routingCode
    ) {
      return true;
    }
    return false;
  }
  searchBicCode() {
    {
      if (this.isFieldsEmpty()) {
        return;
      }

      this.filters = [];
      if (this.criteriaDetails.routingCode) {
        this.filters.push({
          name: "routingCode",
          value: this.criteriaDetails.routingCode,
          type: "String",
          displayName: this.translate.transform("lbl_routing_code"),
        });
      }
      if (this.criteriaDetails.bankName) {
        this.filters.push({
          name: "bankName",
          value: this.criteriaDetails.bankName,
          type: "String",
          displayName: this.translate.transform("lbl_bank_name"),
        });
      }
      if (this.criteriaDetails.branchName) {
        this.filters.push({
          name: "branchName",
          value: this.criteriaDetails.branchName,
          type: "String",
          displayName: this.translate.transform("lbl_bank_branch_name"),
        });
      }
      if (this.criteriaDetails.city) {
        this.filters.push({
          name: "city",
          value: this.criteriaDetails.city,
          type: "String",
          displayName: this.translate.transform("lbl_city"),
        });
      }
      if (this.criteriaDetails.country) {
        this.filters.push({
          name: "countryName",
          value: this.criteriaDetails.country,
          type: "String",
          displayName: this.translate.transform("lbl_country"),
        });
      }
      if (this.criteriaDetails.bicCode) {
        this.filters.push({
          name: "bicCode",
          value: this.criteriaDetails.bicCode,
          type: "String",
          displayName: this.translate.transform("lbl_bic_code"),
        });
      }

      this.isDataSearched = false;
      this.bicCodeSrv
        .searchBicCode([...this.filters])
        .pipe(catchError((err) => {
          this.isDataSearched = true;
          return of(err);
         })
        )
        .subscribe((serviceResponse) => {
          this.isDataSearched = true;
          this.bicCodeToggle = true;
          this.bicCodeSearchResponseMap = [];
          for (const obj of serviceResponse.dataList) {
            const bicCodeSearchResponse: any = {};
            bicCodeSearchResponse.id = obj[0];
            bicCodeSearchResponse.bicCode = obj[1];
            bicCodeSearchResponse.bankName = obj[2];
            bicCodeSearchResponse.branchName = obj[3];
            bicCodeSearchResponse.city = obj[4];
            bicCodeSearchResponse.state = obj[5];
            bicCodeSearchResponse.location = obj[6];
            bicCodeSearchResponse.country = obj[7];
            bicCodeSearchResponse.address1 = obj[8];
            bicCodeSearchResponse.address2 = obj[9];
            bicCodeSearchResponse.address3 = obj[10];
            bicCodeSearchResponse.routingCode = obj[11];
            bicCodeSearchResponse.bankCode = obj[12];
            bicCodeSearchResponse.branchCode = obj[13];
            this.bicCodeSearchResponseMap.push(bicCodeSearchResponse);
          }
        });
    }
  }
}
