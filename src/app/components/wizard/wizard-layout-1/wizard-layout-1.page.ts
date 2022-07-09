import { Component, Output, EventEmitter, Input, ViewChild, OnChanges } from '@angular/core';

@Component({
  selector: 'cs-wizard-layout-1',
  templateUrl: 'wizard-layout-1.page.html',
  styleUrls: ['wizard-layout-1.page.scss'],
})
export class WizardLayout1Page implements OnChanges {
  @Input() data: any;
  @Output() onFinish = new EventEmitter();
  @Output() onNext = new EventEmitter();
  @Output() onPrevious = new EventEmitter();

  @ViewChild('wizardSlider', {static: false} ) slider;

  sliderOptions = { pager: true };

  prev = false;
  next = true;
  ignoreDidChange = false;

  constructor() { }

  ngOnChanges(changes: { [propKey: string]: any }) {
    this.data = changes['data'].currentValue;
  }

  onFinishFunc() {
    if (event) {
      event.stopPropagation();
    }
    this.onFinish.emit();
  }

  onNextFunc() {
    if (event) {
      event.stopPropagation();
    }
    this.onNext.emit();
    this.slider.slideNext(300);
  }

  onPreviousFunc() {
    this.onPrevious.emit();
    this.slider.slidePrev(300);
  }

  ionSlideReachStart(event) {
    this.prev = false;
    this.next = true;
    this.ignoreDidChange = true;
  }

  ionSlideReachEnd(event) {
    this.prev = true;
    this.next = false;
    this.ignoreDidChange = true;
  }

  ionSlideDidChange(event) {
    if (this.ignoreDidChange) {
      this.ignoreDidChange = false;
    } else {
      this.prev = true;
      this.next = true;
    }
  }
}
