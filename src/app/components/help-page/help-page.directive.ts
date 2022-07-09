import { Directive, Input, ElementRef } from '@angular/core';

@Directive({
  selector: '[appHelpPage]'
})
export class HelpPageDirective {

  @Input() helpContainer;
  @Input() helpLabel;
  constructor(private el: ElementRef) {
    console.log(el);
    console.log(this.helpContainer);
    console.log(this.helpLabel);
   }

}
