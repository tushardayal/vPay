import { Component, OnInit } from '@angular/core';
import { DashboardService } from '../../dashboard-service';

@Component({
  selector: 'processing',
  templateUrl: './processing.page.html',
  styleUrls: ['./processing.page.scss'],
})
export class ProcessingPage implements OnInit {
  data;
  isLoading = false;
  constructor(private dashboardService: DashboardService) { }

  ngOnInit() {
    this.getProcessingTxnCount();
  }

  getProcessingTxnCount(){
    this.isLoading = true;
    this.dashboardService.getProcessingTxnCount().subscribe(value => {
      this.data = value.txnCounts;
      this.isLoading = false;
      console.log("getProcessingTxnCount", this.data);
    });
  }

  refreshPage() {
    console.log("refreshPage");
    this.dashboardService.widgetEditMode = false;
    this.getProcessingTxnCount();
  }
}
