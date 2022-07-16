import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {MISService} from "../mis.service";
import {Chart} from "chart.js";
import {graphColorCodes} from "../../../../../appConstants";
import {ToastService} from "../../../../../services/aps-services/toast-service";

@Component({
    selector: 'app-payment-volume',
    templateUrl: './payment-volume.component.html',
    styleUrls: ['./payment-volume.component.scss'],
})
export class PaymentVolumeComponent implements OnInit {

    @ViewChild("barCanvas", {static: false}) barCanvas: ElementRef;

    paymentVolBarChart: Chart;
    paymentChartData;

    constructor(private misService: MISService,
                private toastCtrl: ToastService) {
    }

    doRefresh() {
        this.ngOnInit();
    }

    ngOnInit() {
        this.misService.getTransactionVolumeDetails().subscribe((response: any) => {
            if (response.transactionDetails && response.transactionDetails.length > 0) {
                this.paymentChartData = this.massageDataForBarChart(response.transactionDetails);
                this.createChart(this.paymentChartData);
            } else {
                this.paymentChartData = null;
            }
        });
    }

    massageDataForBarChart(transactionDetails) {

        const data: any = {};
        const labels: string[] = [];
        const dailyObj = {
            label: "Daily",
            backgroundColor: graphColorCodes[0],
            data: [],
            dataObj: []
        };
        const weeklyObj = {
            label: "Weekly",
            backgroundColor: graphColorCodes[1],
            data: [],
            dataObj: []
        };
        // const datasets: any[] = [, {label: "Weekly", data: []}];
        for (const transaction of transactionDetails) {
            labels.push(transaction.transactionType);
            for (const txn of transaction.txnCount) {
                if (txn.processName === dailyObj.label) {
                    dailyObj.data.push(parseInt(txn.txnCount));
                    dailyObj.dataObj.push({
                        txnCount: txn.txnCount,
                        txnVolume: txn.txnVolume,
                        processName: txn.processName,
                        paymentMethod: transaction.transactionType
                    });
                    /*({
                        label: transaction.transactionType,
                        // tslint:disable-next-line:radix
                        value: parseInt(txn.txnVolume),
                        // tslint:disable-next-line:radix
                        noTrans: parseInt(txn.txnCount)
                    });*/
                } else if (txn.processName === weeklyObj.label) {
                    weeklyObj.data.push(parseInt(txn.txnCount));
                    weeklyObj.dataObj.push({
                        txnCount: txn.txnCount,
                        txnVolume: txn.txnVolume,
                        processName: txn.processName,
                        paymentMethod: transaction.transactionType
                    });
                        /*({
                        label: transaction.transactionType,
                        // tslint:disable-next-line:radix
                        value: parseInt(txn.txnVolume),
                        // tslint:disable-next-line:radix
                        noTrans: parseInt(txn.txnCount)
                    });*/
                }
            }
        }
        data.labels = labels;
        data.datasets = [dailyObj, weeklyObj];
        return data;
    }
    ionViewDidEnter() {

    }

    createChart(data) {

        const obj = this;
        this.paymentVolBarChart = new Chart(this.barCanvas.nativeElement, {
            type: "bar",
            data: {
                labels: data.labels,
                datasets: data.datasets/*[
                    {
                        label: "Daily",
                        backgroundColor: "pink",
                        borderColor: "red",
                        borderWidth: 1,
                        data: [3, 5],
                    },
                    {
                        label: "Weekly",
                        backgroundColor: "lightblue",
                        borderColor: "blue",
                        borderWidth: 1,
                        data: [4, 7]
                    }
                ]*/
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    yAxes: [
                        {
                            ticks: {
                                beginAtZero: true
                            }
                        }
                    ]
                },
                tooltips: {
                    enabled: false
                },
                onClick: graphClickEvent
            }
        });
        function graphClickEvent(event, array) {
            if (array[0]) {
                const item = array[0];
                const index = item._index;
                const activePoint = obj.paymentVolBarChart.getElementAtEvent(event)[0];
                const data1 = activePoint._chart.data;
                const datasetIndex = activePoint._datasetIndex;
                const label = data1.datasets[datasetIndex].label;
                const value = data1.datasets[datasetIndex].dataObj[activePoint._index];
                obj.toastCtrl.presentToast(
                    "No. of Transaction: " + value.txnCount + "\n Volume : " + value.txnVolume
                );
            }
        }
    }


}
