import { Component, OnInit, ViewChild, ElementRef, Input } from '@angular/core';
import { DashboardService } from '../../dashboard-service';
import { Chart } from "chart.js";
import { ToastService } from 'src/app/services/aps-services/toast-service';
import { ObjTransferService } from 'src/app/services/aps-services/obj-transfer.service';
import {environment} from "../../../../environments/environment";
import {graphColorCodes} from "../../../appConstants";


@Component({
  selector: 'transaction-status-summary',
  templateUrl: './transaction-status-summary.page.html',
  styleUrls: ['./transaction-status-summary.page.scss'],
})
export class TransactionStatusSummaryPage implements OnInit {

  @ViewChild("barCanvas", { static: false }) barCanvas: ElementRef;
  private barChart: Chart;
  frequency;
  chartDataObj;
  selectedType;
  frequencyData = [
    {
      id: 'Weekly',
      displayName: 'Weekly'
    },
    {
      id: 'Fortnightly',
      displayName: 'Fortnightly'
    },
    {
      id: 'Monthly',
      displayName: 'Monthly'
    },
    {
      id: 'Quarterly',
      displayName: 'Quarterly'
    }
  ];
  environment = environment;
  constructor(private dashboardService: DashboardService,
              private toastCtrl: ToastService,
              private objTransSrv: ObjTransferService, ) { }

  ngOnInit() {

    this.selectedType = this.objTransSrv.getObjData('type');
    // this.objTransSrv.removeObj('type');
    this.frequency = this.frequencyData[0];

  }

  ngAfterViewInit() {
    // console.log("ngAfterViewInit ");
    this.getTransactionSummary(this.frequency.displayName);
  }
  onChangedFrequency() {
    this.getTransactionSummary(this.frequency.displayName);
  }

  getTransactionSummary(frequency) {
    //// console.log("frequency", frequency);
    this.dashboardService.getTransactionStatusSummary(this.selectedType.value, frequency).subscribe(value => {
      this.chartDataObj = value.data;
      this.getChartData();
    });

  }
  refreshPage() {
    // console.log("refreshPage");
    this.dashboardService.widgetEditMode = false;
    this.getTransactionSummary(this.frequency.displayName);
  }

  graphColorCodes = ['#0093d0', '#8884bc', '#b5b4aa', '#7565c0', '#504486', '#27aedf', '#ae9dc8', '#c1bab0', '#847caa', '#8acef2', '#72699e', '#57c0e6', '#006da3', '#deddd8', '#968eb6', '#2e52a0', '#c7c8ca', '#a0c7d3', '#c1bab0', '#3690bc', '#eae7f1', '#4c92ce', '#c4d6ee', '#00a8bd', '#8884bc', '#adb2b7'];

  getChartData() {

    const barChartData = [];
    const chartdata = [];
    let colorIndex = 0;
    for (const obj of this.chartDataObj) {
      chartdata.push(obj.values);
      barChartData.push({
        label: obj.key,
        data: [...obj.values].map(e => e.value),
        backgroundColor: this.graphColorCodes[colorIndex], // array should have same number of elements as number of dataset
        borderColor: this.graphColorCodes[colorIndex], // array should have same number of elements as number of dataset
        borderWidth: 0,
      });

      colorIndex = (colorIndex + 1) % this.chartDataObj.length;
    }
    // console.log("chartdata", chartdata);
    // for (let i = 0; i < barChartData.length; i++) {
    //   for (let k = 0; k < chartdata.length; k++) {
    //     if (i == k) {
    //       barChartData[i].data = chartdata[k].map(e => e.value);
    //     }
    //   }
    // }

    const labelTitle = [];
    for (const obj of this.chartDataObj[0].values) {
      labelTitle.push(obj.label);
    }


    const barCanvasCreate = this.barCanvas.nativeElement;
    this.barChart = new Chart(barCanvasCreate, {
      type: "bar",
      data: {
        labels: labelTitle,
        datasets: barChartData,
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          yAxes: [
            {
              stacked: true,
              ticks: {
                beginAtZero: true,
                fontSize: 12
              },
              scaleLabel: {
                display: true,
                labelString: 'Trasaction Status'
              }
            }
          ],
          xAxes: [
            {
              stacked: true,
              ticks: {
                callback(label) {
                  if (/\s/.test(label)) {
                    return label.split(" ");
                  } else {
                    return label;
                  }
                },
                fontSize: 10,
                minRotation: 360,
                textAlign: 'center'
              },
              scaleLabel: {
                display: true,
                labelString: 'Trade Finance Products'
              }
            }
          ]
        }
      }
    });

  }

}
