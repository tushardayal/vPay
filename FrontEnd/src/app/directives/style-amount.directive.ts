import {AfterViewInit, Directive, ElementRef, Input, OnChanges, Renderer2, SimpleChanges} from '@angular/core';

@Directive({
  selector: '[appStyleAmount]'
})
export class StyleAmountDirective implements AfterViewInit {

  @Input() amount;
  constructor(private renderer: Renderer2, private el: ElementRef) {
  }
  ngOnChanges(changes: SimpleChanges){
    if(changes.amount){
      this.styleAmount();
    }
  }
  ngAfterViewInit() {
  this.styleAmount();
  }

  styleAmount() {
    const str = this.amount ? this.amount : this.el.nativeElement.innerText;
    // console.log('ngAfterViewInit', str);

    let newAmtStr = str;
    const strSplitedAmt = str.split('.');
    if (strSplitedAmt.length > 1) {
      const wholeAmt = strSplitedAmt[0];
      const decAmt = strSplitedAmt[1];
      newAmtStr = `${wholeAmt}.<small>${decAmt}</small>`;
    }
    this.el.nativeElement.innerHTML = newAmtStr;
  }
}
