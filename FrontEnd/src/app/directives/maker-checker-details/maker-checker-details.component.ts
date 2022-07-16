import {Component, OnInit, Input, SimpleChanges, OnChanges} from '@angular/core';

@Component({
  selector: 'maker-checker-details',
  templateUrl: './maker-checker-details.component.html',
  styleUrls: ['./maker-checker-details.component.scss'],
})
export class MakerCheckerDetailsComponent implements OnChanges {

  @Input() data;
  showMakerCheckerDet = false;
  constructor() {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.data.makerName || this.data.modifiedOn || this.data.makerChannel
        || this.data.checkerName || this.data.checkedOn || this.data.checkerChannel
        || this.data.verifiedBy || this.data.verifiedOn) {
      this.showMakerCheckerDet = true;
    }
  }

}
