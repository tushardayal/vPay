import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { DashboardService } from '../../dashboard-service';
import { Chart } from "chart.js";
import { ToastService } from 'src/app/services/aps-services/toast-service';
import { ObjTransferService } from 'src/app/services/aps-services/obj-transfer.service';
import {environment} from "../../../../environments/environment";
import {graphColorCodes} from "../../../appConstants";


@Component({
  selector: 'transaction-wise-summary',
  templateUrl: './transaction-wise-summary.page.html',
  styleUrls: ['./transaction-wise-summary.page.scss'],
})
export class TransactionWiseSummaryPage implements OnInit {

  @ViewChild("barCanvas", { static: false }) barCanvas: ElementRef;
  environment = environment;
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
  ]


  public barChartData = [];
  constructor(private dashboardService: DashboardService, private toastCtrl: ToastService,
    private objTransSrv: ObjTransferService) { }

  ngOnInit() {
    this.selectedType = this.objTransSrv.getObjData('type');
    this.frequency = this.frequencyData[0];

  }

  ngAfterViewInit() {

    this.getTransactionSummary(this.frequency.displayName);
  }
  onChangedFrequency() {
    this.getTransactionSummary(this.frequency.displayName);
  }

  getTransactionSummary(frequency) {
    this.dashboardService.getTransactionWiseSummary(this.selectedType.value, frequency).subscribe(value => {
      this.chartDataObj = value.data;
      this.getChartData();
    });

  }
  refreshPage() {
    // console.log("refreshPage");
    this.dashboardService.widgetEditMode = false;
    this.getTransactionSummary(this.frequency.displayName);
  }
  graphColorCodes = [
    "#8884bc",
    "#0093d0",
    "#b5b4aa",
    "#7565c0",
    "#504486"
  ];

  getChartData() {
    // console.log("this.chartDataObj", this.chartDataObj);
    const barChartData = [];
    const chartdata = [];
    let colorIndex = 0;
    for (const obj of this.chartDataObj) {
      chartdata.push(obj.values);
      barChartData.push({
        label: obj.key,
        data: [...obj.values].map(e => e.value),
        backgroundColor: this.graphColorCodes[colorIndex], // array should have same number of elements as number of dataset
        borderColor:  this.graphColorCodes[colorIndex], // array should have same number of elements as number of dataset
        borderWidth: 0,
      });
      colorIndex = (colorIndex + 1) % this.chartDataObj.length;
    }

    const labelTitle = [];
    for (const obj of this.chartDataObj[0].values) {
      labelTitle.push(obj.label);
    }
    ////console.log("chartDataObj", this.chartDataObj);

    let barCanvasCreate = this.barCanvas.nativeElement;
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
              ticks: {
                beginAtZero: true,
                fontSize: 12
              },
              scaleLabel: {
                display: true,
                labelString: 'No of Transactions Pending for Auth'
              }
            }
          ],
          xAxes: [
            {
              ticks: {
                callback: function (label) {
                  if (/\s/.test(label)) {
                    return label.split(" ");
                  } else {
                    return label;
                  }
                  // if (label.length > 6) {
                  //   return label.substr(0, 6) + '...'; //truncate
                  // } else {
                  //   return label
                  // }
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


