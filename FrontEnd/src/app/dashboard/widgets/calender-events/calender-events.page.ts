import { Component, OnInit } from '@angular/core';
import { DashboardService } from '../../dashboard-service';
import {BehaviorSubject, Observable} from "rxjs";
import {map, shareReplay} from "rxjs/operators";


@Component({
  selector: 'calender-events',
  templateUrl: './calender-events.page.html',
  styleUrls: ['./calender-events.page.scss'],
})
export class CalenderEventsPage implements OnInit {
  data$ = new Observable<any>(null);
  isLoading = false;
  constructor(private dashboardService: DashboardService) { }

  ngOnInit() {
    this.getUpcomingEventsDetails();
  }

  getUpcomingEventsDetails() {
    this.isLoading = true;
    this.data$ = this.dashboardService.getUpcomingEventsDetails()
        .pipe(
            map(value => {
              this.isLoading = false;
              return value.upcomingEventsDetails;
            }), shareReplay(1));
  }
  refreshPage() {
    this.dashboardService.widgetEditMode = false;
    this.getUpcomingEventsDetails();
  }

}
