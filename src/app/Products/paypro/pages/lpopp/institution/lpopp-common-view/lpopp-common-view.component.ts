import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-lpopp-common-view',
  templateUrl: './lpopp-common-view.component.html',
  styleUrls: ['./lpopp-common-view.component.scss'],
})
export class LpoppCommonViewComponent implements OnInit {

  @Input() data: any;
  dataObj: any;
  constructor() { }

  ngOnInit() {
    this.dataObj = this.data;
  }

}
