import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {ModalController} from "@ionic/angular";

@Component({
  selector: 'app-lpopp-modal',
  templateUrl: './lpopp-modal.component.html',
  styleUrls: ['./lpopp-modal.component.scss'],
})
export class LpoppModalComponent implements OnChanges {

  @Input() institution;
  @Output() transactionData = new EventEmitter();

  outPaymentDetails: any;
  selectedOutPaymentData: any;
  containersListData: any;
  constructor(public modalController: ModalController) { }

  ngOnChanges(changes: SimpleChanges) {
    if (this.institution.id === 'IRDP') {
      this.outPaymentDetails = this.getOutstandingPaymentDetails();
    } else if (this.institution.id === 'CICTP') {
      this.containersListData = this.getContainersList();
    }
  }

  getOutstandingPaymentDetails() {
    const headers = [
      {
        displayName: "Tax Period",
        type: "String",
        isDisplay: "Y",
        methodName: "BatchNo"
      },
      {
        displayName: "Payment Period",
        type: "String",
        isDisplay: "Y",
        methodName: "MakerChannel"
      },
      {
        displayName: "Due Date",
        type: "String",
        isDisplay: "Y",
        methodName: "PaymentMethodName"
      },
      {
        displayName: "DIN",
        type: "String",
        isDisplay: "Y",
        methodName: "PaymentMethodName"
      },
      {
        displayName: "Payemnt Period Begin Date",
        type: "String",
        isDisplay: "Y",
        methodName: "PaymentMethodName"
      },
      {
        displayName: "Payemnt Period End Date",
        type: "String",
        isDisplay: "Y",
        methodName: "PaymentMethodName"
      },
      {
        displayName: "Tax Payment Amount",
        type: "String",
        isDisplay: "Y",
        methodName: "PaymentMethodName"
      },
      {
        displayName: "Penalty Amount",
        type: "String",
        isDisplay: "Y",
        methodName: "PaymentMethodName"
      },
      {
        displayName: "Interest Amount",
        type: "String",
        isDisplay: "Y",
        methodName: "PaymentMethodName"
      }
    ];

    const dataList = [
      ['1768', '18030', '2018-04-03', '100000114155626', '2018-04-03', '2018-04-03', '', '', ''],
      ['1768', '18020', '2018-04-03', '100000114155626', '2018-04-03', '2018-04-03', '', '', ''],
      ['1768', '18010', '2018-04-03', '100000114155626', '2018-04-03', '2018-04-03', '', '', ''],
      ['1768', '18060', '2018-04-03', '100000114155626', '2018-04-03', '2018-04-03', '', '', '']
    ];
    return {headers, dataList};
  }

  toggleGroup(group: any) {
    if (event) {
      event.stopPropagation();
    }
    group.show = !group.show;
  }

  confirm() {
    console.log('selectedOutPaymentData', this.selectedOutPaymentData);
    const data = this.outPaymentDetails.headers;
    // tslint:disable-next-line:forin
    for (const index in data) {
      data[index].value = this.selectedOutPaymentData[index];
    }
    this.transactionData.emit(data);
    // this.modalController.dismiss({data});
  }

  private getContainersList() {
    const headers = [
      {
        displayName: "Container No",
        type: "String",
        isDisplay: "Y",
        methodName: "BatchNo"
      },
      {
        displayName: "Line Release",
        type: "String",
        isDisplay: "Y",
        methodName: "MakerChannel"
      },
      {
        displayName: "SLPA WARF Paid ",
        type: "String",
        isDisplay: "Y",
        methodName: "PaymentMethodName"
      },
      {
        displayName: "Weight Charges",
        type: "String",
        isDisplay: "Y",
        methodName: "PaymentMethodName"
      },
      {
        displayName: "Collection Date",
        type: "String",
        isDisplay: "Y",
        methodName: "PaymentMethodName"
      },
      {
        displayName: "Outstanding Amount",
        type: "String",
        isDisplay: "Y",
        methodName: "PaymentMethodName"
      },
      {
        displayName: "Tax",
        type: "String",
        isDisplay: "Y",
        methodName: "PaymentMethodName"
      },
      {
        displayName: "Total",
        type: "String",
        isDisplay: "Y",
        methodName: "PaymentMethodName"
      }
    ];

    const dataList = [
      ['ASDF123', 'Y', 'Y', '', '', '', '', ''],
      ['QWER658', 'N', 'N', '', '', '', '', ''],
      ['WERT963', 'Y', 'N', '', '', '', '', ''],
      ['YURT978', 'N', 'Y', '', '', '', '', ''],
      ['LKJT978', 'Y', 'Y', '', '', '', '', '']
    ];
    return {headers, dataList};
  }

  closeModal() {
    this.modalController.dismiss();
  }

  fetchAmount(data: any) {
    data[5] = 100;
    data[6] = 40;
    data[7] = 140;
    this.setContainersList();
  }

  setContainersList() {
    const checkedData = this.containersListData.dataList.filter(x => x.isChecked);
    const headerData = this.containersListData.headers;
    let dataToPass = [];

    for (const dataList of checkedData) {
      let tempData = [];
      let headerIndex = 0;
      for (let headerObj of headerData) {
        headerObj.value = dataList[headerIndex];
        tempData.push(JSON.parse(JSON.stringify(headerObj)));
        headerIndex++;
      }
      dataToPass.push(tempData);
    }
    console.log('selectedContainers ', dataToPass);
    this.transactionData.emit(dataToPass);
    // this.modalController.dismiss({data: dataToPass});
  }


}
