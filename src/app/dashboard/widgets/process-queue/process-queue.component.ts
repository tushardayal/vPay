import { Component, OnInit } from '@angular/core';
import { DashboardService } from '../../dashboard-service';

@Component({
  selector: 'process-queue',
  templateUrl: './process-queue.component.html',
  styleUrls: ['./process-queue.component.scss'],
})
export class ProcessQueueComponent implements OnInit {

  // @Output() onItemClick = new EventEmitter();
  data;
  isLoading = false;

  constructor(private dashboardService: DashboardService) {}

  getProcessQueueCount() {
    this.isLoading = true;
    this.dashboardService.getProcessQueueCount().subscribe(value => {
      this.data = value.queueCounts;
      this.isLoading = false;
    });
  }

  ngOnInit() {
    this.getProcessQueueCount();
  }

  refreshPage() {
    this.dashboardService.widgetEditMode = false;
    this.getProcessQueueCount();
  }
}
