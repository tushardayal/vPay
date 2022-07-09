import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';

@Component({
  selector: 'app-no-record-found',
  templateUrl: './no-record-found.component.html',
  styleUrls: ['./no-record-found.component.scss'],
})
export class NoRecordFoundComponent implements OnInit {

  @Output() refreshPageEventEmmiter = new EventEmitter<any>();
  @Input() err;
  @Input() noRefresh;
  @Input() msg;
  constructor() { }

  ngOnInit() {}

  refreshPage(event) {
    if (!this.noRefresh) {
      this.refreshPageEventEmmiter.emit(event);
    }
  }
}
