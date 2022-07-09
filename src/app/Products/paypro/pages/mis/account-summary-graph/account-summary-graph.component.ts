import {Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {AccountSummaryService} from "../../account-summary/account-summary.service";
import {Chart} from "chart.js";
import {ToastService} from "../../../../../services/aps-services/toast-service";
import {ModalController} from "@ionic/angular";
import {ObjTransferService} from "../../../../../services/aps-services/obj-transfer.service";
import {UserService} from "../../../../../services/aps-services/user.service";
import {environment} from "../../../../../../environments/environment";
import {graphColorCodes} from "../../../../../appConstants";
import {catchError, map} from "rxjs/operators";

@Component({
    selector: 'app-account-summary-graph',
    templateUrl: './account-summary-graph.component.html',
    styleUrls: ['./account-summary-graph.component.scss'],
})
export class AccountSummaryGraphComponent implements OnInit {

    @Input() isModal: boolean;
    casaSummary;
    selectedCorporate;
    constructor(private accountSummaryService: AccountSummaryService,
                private modalController: ModalController,
                private objTransSrv: ObjTransferService,
                private userService: UserService,
                private toastCtrl: ToastService) {
    }

    @ViewChild("doughnutCanvas", {static: false}) doughnutCanvas: ElementRef;
    allAccounts: any[];
    chartDataObj;
    private doughnutChart: Chart;
    environment = environment;

    ngOnInit() {
    }

    ngAfterViewInit() {
        this.doRefresh();
    }

    getBalanceInPercentage(accounts) {
        let totoalBalance = 0;
        for (const account of accounts) {
            totoalBalance = totoalBalance + parseFloat(account.availableBalanceBaseCurrency.value.replace(/,/g, ''));
        }
        for (const account of accounts) {
            account.balancePercentage = (parseFloat(account.availableBalanceBaseCurrency.value.replace(/,/g, '')) / totoalBalance) * 100;
        }
    }
    massageDataForChart() {
        this.getBalanceInPercentage(this.allAccounts);
        this.chartDataObj = [];
        for (const account of this.allAccounts) {
            const obj = {
                label: account.accountNo.value + '-' + account.currencyCode.value,
                value: account.balancePercentage.toFixed(2),
                balance: account.availableBalance.value
            };
            this.chartDataObj.push(obj);
        }
        console.log('chartData', this.chartDataObj);
    }

    createChart() {
        const obj = this;
        this.doughnutChart = new Chart(this.doughnutCanvas.nativeElement, {
            type: "doughnut",
            data: {
                labels: this.chartDataObj.map(e => e.label),
                datasets: [
                    {
                        label: "# of Votes",
                        data: this.chartDataObj.map(e => e.value),
                        backgroundColor: graphColorCodes,
                        // hoverBackgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#FF6384", "#36A2EB", "#FFCE56"]
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                /*cutoutPercentage: 80,*/
                legend: {
                    // display: false,
                    // position: 'bottom',
                    labels: {
                        // usePointStyle: true // only for prettier labels
                    }
                },
                /*plugins: {
                    datalabels: {
                        formatter: (value, ctx) => {
                            let sum = 0;
                            const dataArr = ctx.chart.data.datasets[0].data;
                            dataArr.map(data => { sum += data;});
                            const percentage = (value * 100 / sum).toFixed(2) + "%";
                            return percentage;
                        },
                        color: '#fff',
                    }
                },*/
                tooltips: {
                    enabled: false,
                    /*callbacks: {
                        label(tooltipItem, data) {
                            console.log('tooltipItem', tooltipItem);
                            return data['labels'][tooltipItem['index']] + '## ' + data['datasets'][0]['data'][tooltipItem['index']] + '%';
                        }
                    }*/
                },
                onClick: graphClickEvent
            }
        });

        function graphClickEvent(event, array) {
            if (array[0]) {
                const item = array[0];
                const index = item._index;
                /*const label = item._chart.data.labels[index];
                const value = item._chart.data.datasets[0].data[index];
                const value = item._chart.data.datasets[0].backgroundColor[index];*/
                const label = obj.chartDataObj[index].label;
                const value = obj.chartDataObj[index].value;
                const balance = obj.chartDataObj[index].balance;
                obj.toastCtrl.presentToast(
                    "Account No: " + label + "\n Percentage : "
                    + value + "\n Balance :" + balance
                );
            }
        }
    }

   /* closeModal() {
        this.modalController.dismiss();
    }*/
    doRefresh() {
        console.log('Refreshhh');
        const isModal =  this.objTransSrv.getObjData('data');
        this.objTransSrv.removeObj('data');
        this.isModal = isModal;
        if (this.userService.isGroupSelected) {
            this.accountSummaryService.getGroupSummary().subscribe(value => {
                this.casaSummary = value.casaSummary;
                this.selectedCorporate = this.casaSummary[0];
                this.onChangeCorporate();
            });
        } else {
            this.getSummary();
        }
    }

    getSummary(data?) {
        this.accountSummaryService.getCasaSumm(data)
            .pipe(catchError(err => this.chartDataObj = []))
            .subscribe((value: any) => {
                this.chartDataObj = [];
                if (value.listOfAccountSummary && value.listOfAccountSummary.length > 0) {
                    const accountGroups = value.listOfAccountSummary[0].accountGroupSummaryMap[0].accountGroups;
                    this.allAccounts = [];
                    for (const accountGrp of accountGroups) {
                        this.allAccounts = this.allAccounts.concat(accountGrp.accounts);
                    }
                    console.log(this.allAccounts);
                    this.massageDataForChart();
                    this.createChart();
                }
            });
    }

    onChangeCorporate() {
        console.log(this.selectedCorporate);
        if (!this.selectedCorporate) {
            this.chartDataObj = [];
            return;
        }
        const data = {
            cifNumber: this.selectedCorporate.customerID,
            accountType: 'casa'
        };
        this.getSummary(data);
    }
}
