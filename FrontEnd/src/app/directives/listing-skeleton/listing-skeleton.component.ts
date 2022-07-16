import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'listing-skeleton',
  templateUrl: './listing-skeleton.component.html',
  styleUrls: ['./listing-skeleton.component.scss'],
})
export class ListingSkeletonComponent implements OnInit {

  @Input() itemsCount;
  range = new Array(6);
  constructor() { }

  ngOnInit() {
    if (this.itemsCount) {
      this.range = new Array(this.itemsCount);
    }
  }

}
