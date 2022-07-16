import { Injectable } from "@angular/core";
import { AngularAjaxService } from "src/app/services/aps-services/ajaxService/angular-ajax.service";
import { ToastService } from "src/app/services/aps-services/toast-service";
import { map } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class ExchangeRateService {
  CONSTANTS = {
    CREDITAMOUNTTYPE: "CREDITAMOUNT",
    DEBITAMOUNTTYPE: "DEBITAMOUNT",
    DEALNO_CHECK: "commons/generalService/private/getDealNoCheck",
    EXCHANGE_RATE: "exchangeRateService/private/",
  };
  constructor(
    private ajaxService: AngularAjaxService,
    private toastSrv: ToastService
  ) {}

  checkDealNo() {
    return this.ajaxService.sendAjaxRequest(this.CONSTANTS.DEALNO_CHECK, {});
  }

  getExchangeRate(data) {
    console.log(data);
    const url = this.CONSTANTS.EXCHANGE_RATE + data.serviceType;
    delete data.serviceType;
    return this.ajaxService.sendAjaxRequest(
      url,
      data
    );
  }

  public calculateDrCrAmount(paymentObj) {
    let amountType = "";
    let serviceType = "";
    let updatedAmount = "";

    if (paymentObj.type === this.CONSTANTS.DEBITAMOUNTTYPE && paymentObj.debitAmount.value) {
      if (paymentObj.paymenthandlerobj.lastDebitAmt === paymentObj.debitAmount.value &&
          paymentObj.paymenthandlerobj.lastDebitCCYId === paymentObj.selectedCorporateAccount.value.id) {
        return;
      }
      updatedAmount = paymentObj.debitAmount.value;
      serviceType = "getCreditAmount";
      amountType = "debitAmount";
      paymentObj.changedAmount = this.CONSTANTS.DEBITAMOUNTTYPE;
    } else if (
      paymentObj.type === this.CONSTANTS.CREDITAMOUNTTYPE &&
      paymentObj.payableAmount.value
    ) {
      if (paymentObj.paymenthandlerobj.lastPayableAmt === paymentObj.payableAmount.value &&
          paymentObj.paymenthandlerobj.lastCreditCCYId === paymentObj.selectedCreditCurrency.id) {
        return;
      }
      serviceType = "getDebitAmount";
      amountType = "creditAmount";
      paymentObj.changedAmount = this.CONSTANTS.CREDITAMOUNTTYPE;
      updatedAmount = paymentObj.payableAmount.value;
    } else if (paymentObj.type === "dealNo") {
      const changedAmountType = paymentObj.changedAmount;
      if (changedAmountType === this.CONSTANTS.DEBITAMOUNTTYPE) {
        amountType = "debitAmount";
        serviceType = "getCreditAmount";
        updatedAmount = paymentObj.debitAmount.value;
      } else if (changedAmountType === this.CONSTANTS.CREDITAMOUNTTYPE) {
        serviceType = "getDebitAmount";
        amountType = "creditAmount";
        updatedAmount = paymentObj.payableAmount.value;
      }
    }

    if (
      serviceType &&
      serviceType !== "" &&
      paymentObj.selectedPaymentMethod.value &&
      paymentObj.selectedPaymentMethod.value === "EP5"
    ) {
      const filters = [];
      filters.push({ name: amountType, value: updatedAmount, type: "String" });
      filters.push({
        name: "creditCurrencyId",
        value: paymentObj.selectedCreditCurrency.id,
        type: "String",
      });
      filters.push({
        name: "debitCurrencyId",
        value: paymentObj.selectedCorporateAccount.value.enrichments.currencyId,
        type: "String",
      });
      if (
        paymentObj.dealNumber &&
        paymentObj.dealNumber !== "" &&
        paymentObj.selectedCreditCurrency.displayName &&
        paymentObj.selectedCorporateAccount.value.enrichments.currencyCode &&
        paymentObj.selectedCreditCurrency.displayName !==
          paymentObj.selectedCorporateAccount.value.enrichments.currencyCode
      ) {
        if (
          paymentObj.dealNumber &&
          paymentObj.dealNumber !== "" &&
          paymentObj.valueDate.value &&
          paymentObj.valueDate.value !== ""
        ) {
          paymentObj.paymenthandlerobj.lastDealNo = paymentObj.dealNumber;
          filters.push({
            name: "dealNo",
            value: paymentObj.dealNumber,
            type: "String",
          });
          filters.push({
            name: "valueDate",
            value: paymentObj.valueDate.value,
            type: "String",
          });
        } else {
          return;
        }
      }
      const data: any = {};
      data.filters = filters;
      data.serviceType = serviceType;
      return this.getExchangeRate(data).pipe(
        map((response: any) => {
          if (response.responseStatus.status === "0") {
            response.changedAmountType = paymentObj.changedAmount;
            return response;
          }
        })
      );
    } else if (serviceType && serviceType !== "") {
      const filters = [];
      filters.push({ name: amountType, value: updatedAmount, type: "String" });
      filters.push({
        name: "creditCurrencyId",
        value: paymentObj.selectedCreditCurrency.id,
        type: "String",
      });
      filters.push({
        name: "debitCurrencyId",
        value: paymentObj.selectedCorporateAccount.value.enrichments.currencyId,
        type: "String",
      });
      filters.push({
        name: "debitAccountId",
        value: paymentObj.selectedCorporateAccount.value.id,
        type: "String",
      });

      if (
        paymentObj.dealNumber &&
        paymentObj.dealNumber !== "" &&
        paymentObj.selectedCreditCurrency.displayName &&
        paymentObj.selectedCorporateAccount.value.enrichments.currencyCode &&
        paymentObj.selectedCreditCurrency.displayName !==
          paymentObj.selectedCorporateAccount.value.enrichments.currencyCode
      ) {
        if (
          paymentObj.dealNumber &&
          paymentObj.dealNumber !== "" &&
          paymentObj.valueDate.value &&
          paymentObj.valueDate.value !== ""
        ) {
          filters.push({
            name: "dealNo",
            value: paymentObj.dealNumber,
            type: "String",
          });
          filters.push({
            name: "valueDate",
            value: paymentObj.valueDate.value,
            type: "String",
          });
        } else {
          return;
        }
      }

      const data: any = {};
      data.filters = filters;
      data.serviceType = serviceType;
      return this.getExchangeRate(data).pipe(
        map((response: any) => {
          if (response.responseStatus.status === "0") {
            response.changedAmountType = paymentObj.changedAmount;
            return response;
          }
        })
      );
    }
  }

  calculateAmountForDealNo(paymentObj) {
    if (
      paymentObj.selectedCreditCurrency &&
      paymentObj.selectedCorporateAccount &&
      paymentObj.selectedCreditCurrency.displayName
    ) {
      const debitAccountId = paymentObj.selectedCorporateAccount.value.id;
      let amountType = "";
      let serviceType = "";
      let updatedAmount = "";
      let changedAmountType = "";
      if (
        paymentObj.changedAmount === this.CONSTANTS.DEBITAMOUNTTYPE &&
        paymentObj.debitAmount
      ) {
        serviceType = "getCreditAmount";
        amountType = "debitAmount";
        updatedAmount = paymentObj.debitAmount.value;
        paymentObj.changedAmount = this.CONSTANTS.DEBITAMOUNTTYPE;
        changedAmountType = this.CONSTANTS.DEBITAMOUNTTYPE;
      } else if (
        paymentObj.changedAmount === this.CONSTANTS.CREDITAMOUNTTYPE &&
        paymentObj.payableAmount
      ) {
        serviceType = "getDebitAmount";
        amountType = "creditAmount";
        updatedAmount = paymentObj.payableAmount.value;
        paymentObj.changedAmount = this.CONSTANTS.CREDITAMOUNTTYPE;
        changedAmountType = this.CONSTANTS.DEBITAMOUNTTYPE;
      }
      if (serviceType) {
        const filters = [];
        filters.push({
          name: amountType,
          value: updatedAmount,
          type: "String",
        });
        filters.push({
          name: "creditCurrencyId",
          value: paymentObj.selectedCreditCurrency.id,
          type: "String",
        });
        filters.push({
          name: "debitCurrencyId",
          value:
            paymentObj.selectedCorporateAccount.value.enrichments.currencyId,
          type: "String",
        });
        filters.push({
          name: "debitAccountId",
          value: debitAccountId,
          type: "String",
        });

        if (
          paymentObj.isDealNoApplicable === "yes" &&
          paymentObj.selectedCreditCurrency.displayName &&
          paymentObj.selectedCorporateAccount.value.enrichments.currencyCode &&
          paymentObj.selectedCreditCurrency.displayName !==
            paymentObj.selectedCorporateAccount.value.enrichments.currencyCode
        ) {
          if (
            paymentObj.dealNumber &&
            paymentObj.dealNumber !== "" &&
            paymentObj.valueDate.value &&
            paymentObj.valueDate.value !== ""
          ) {
            filters.push({
              name: "valueDate",
              value: paymentObj.valueDate.value,
              type: "String",
            });
            filters.push({
              name: "dealNo",
              value: paymentObj.dealNumber,
              type: "String",
            });
            filters.push({
              name: "pageFrom",
              value: paymentObj.entityName,
              type: "String",
            });
          } else {
            // this.toastSrv.
            return;
          }
        }
        const data: any = {};
        data.filters = filters;
        data.serviceType = serviceType;
        return this.getExchangeRate(data).pipe(
          map((response: any) => {
            if (response.responseStatus.status === "0") {
              response.changedAmountType = changedAmountType;
              return response;
            }
          })
        );
      }
    }
  }
}
