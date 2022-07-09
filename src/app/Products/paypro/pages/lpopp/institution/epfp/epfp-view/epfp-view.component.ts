import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-epfp-view',
  templateUrl: './epfp-view.component.html',
  styleUrls: ['./epfp-view.component.scss'],
})
export class EpfpViewComponent implements OnInit {

  @Input() data: any;
  dataObj: any;
  constructor() { }

  ngOnInit() {
    this.dataObj = this.data.lpoppRequestDets[0];
  }

}
