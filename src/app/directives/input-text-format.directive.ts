import { Directive, HostListener, ElementRef, Input } from '@angular/core';

@Directive({
  selector: '[appInputTextFormat]'
})
export class InputTextFormatDirective {
  patterns = {
    numeric : /^[0-9]*$/
  };
  @Input() patternType;
  constructor(private elementRef: ElementRef) { }
  @HostListener("keydown", ["$event"])
  onKeydown(evt) {
    if (this.isInvalidPattern(evt.key)) {
      evt.preventDefault();
    }
  }

  isInvalidPattern(input) {
    if (input === 'Backspace') {
      return false;
    }
    if (!this.patternType) {
      return false;
    }
    if (this.patternType && this.patterns[this.patternType]) {
      return !this.patterns[this.patternType].test(input);
    }
    return false;
  }
}
