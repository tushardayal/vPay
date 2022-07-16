import { appConstants } from 'src/app/appConstants';
import { EMPTY, Subject } from 'rxjs';
import { Component, OnInit } from "@angular/core";
import { DashboardService } from "../../dashboard-service";
import { map, catchError, takeUntil } from 'rxjs/operators';
import { of } from 'rxjs';
import { ModalController } from '@ionic/angular';
import { AccountSummaryWidgetViewComponent } from './account-summary-widget-view/account-summary-widget-view.component';
import {environment} from "../../../../environments/environment";
import { UserService } from 'src/app/services/aps-services/user.service';

@Component({
  selector: "account-summary-widget",
  templateUrl: "./account-summary-widget.component.html",
  styleUrls: ["./account-summary-widget.component.scss"],
})
export class AccountSummaryWidgetComponent implements OnInit {
  accountSummaryTypeList;
  accountSummaryTypeMap;
  selectedAccountType;
  selectedAccountCurrency;
  portfolioBalance;
  isLoading = true;
  environment = environment;
  availableCorporate:any[] = [];
  selectedCorporate;
  baseCurrencyCode = appConstants.baseCurrencyCode;
  constructor(private dashboardService: DashboardService,
              private modalCtrl: ModalController,
              private userService: UserService) {
               
              }

  ngOnInit() {
    this.fetchAccountSummary()
  }
  
  fetchAccountSummary(){
    if (this.userService.isGroupSelected) {
      const unsub$ = new Subject();
      const data = { pageFrom:"initiate"} 
      this.dashboardService.getApplicants(data)
      .pipe(takeUntil(unsub$))
      .subscribe((corporateList: any)=>{
        if(corporateList && corporateList.dataList && corporateList.dataList.length>0) {
          this.availableCorporate = corporateList.dataList;
          this.selectedCorporate = this.selectedCorporate?this.selectedCorporate:this.availableCorporate[0];
          this.getAccountTypeWiseBalance();
        }
        unsub$.next()
        unsub$.complete()
        unsub$.unsubscribe();
      })
    }else{
      this.getAccountTypeWiseBalance();
    }
  }

  getAccountTypeWiseBalance() {
    const data:any = {}
    if(this.userService.isGroupSelected && this.selectedCorporate){
      data.dataMap ={
        cifNumber:this.selectedCorporate.id
      }
    }
    this.dashboardService.getAccountTypeWiseBalance(data)
    .pipe(catchError(() => {
      this.isLoading = false;
      return EMPTY;
    }))
    .subscribe((value) => {
      this.isLoading = false;
      const response = value.dataMap.accountSummaryResponse;
      if (response) {
        this.accountSummaryTypeMap = response.accountSummaryTypeMap;
        this.accountSummaryTypeList = response.accountSummaryTypeList;
        this.portfolioBalance = response.portfolioBalance;
        this.selectedAccountType = this.accountSummaryTypeList[0];
        this.onChangeAccTypeMethod();
      }
    });
  }
  onChangeAccTypeMethod() {
    if (this.accountSummaryTypeMap[this.selectedAccountType]) {
      this.selectedAccountCurrency = this.accountSummaryTypeMap[this.selectedAccountType].currencyList[0];
    }
  }

  onChangeGroupMethod(){
    this.isLoading = true;
    this.dashboardService.widgetEditMode = true;
    this.selectedAccountType = null;
    this.selectedAccountCurrency = null;
    this.getAccountTypeWiseBalance();
    this.dashboardService.widgetEditMode = false;
  }

  refreshPage() {
    this.isLoading = true;
    this.dashboardService.widgetEditMode = false;
    this.selectedAccountType = null;
    this.selectedAccountCurrency = null;
    this.getAccountTypeWiseBalance();
  }

 async viewAccounts(typeWiseMap) {
    const modal = await this.modalCtrl.create({
      component: AccountSummaryWidgetViewComponent,
      cssClass: 'select-authorizer-modal',
      componentProps: {
        accounts:typeWiseMap.currencyGroupMap[this.selectedAccountCurrency],
        header:typeWiseMap['availableBalance']['header'],
        accType:typeWiseMap['availableBalance']['type'],
      }
    });
    await modal.present();
  }
}
