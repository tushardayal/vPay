import {Directive, ElementRef, HostListener, OnInit, Output, EventEmitter} from '@angular/core';
import {CurrencyFormatPipe} from "../components/pipes/currency-format-pipe.pipe";
import { NgControl } from '@angular/forms';

@Directive({
    selector: '[appCurrencyFormat]',
    providers: [CurrencyFormatPipe]
})
export class CurrencyFormatDirective implements OnInit {

    
    @Output() onAmountFormat:EventEmitter<string>= new EventEmitter<string>();
    private el: HTMLInputElement;
    // TODO : Take below Params from some constant
    private CURRENCY_INT_MAX_LENGTH = 18;
    private CURRENCY_FRACTION_MAX_LENGTH = 2;
    // private regexStr = '^[0-9\.]*$';

    constructor(
        private elementRef: ElementRef,
        private currencyPipe: CurrencyFormatPipe,
        private ngControl:NgControl
    ) {
        this.el = this.elementRef.nativeElement;
    }

    ngOnInit() {
        // console.log('CurrencyFormatDirective ngOnInit');
        // this.el.value = this.currencyPipe.transform(this.el.value);
    }

    @HostListener("focusin")
    onFocusin() {
        console.log('focus',this.ngControl.control.value);
        // tslint:disable-next-line:max-line-length
        this.ngControl.control.setValue(this.currencyPipe.parse(this.ngControl.control.value, this.CURRENCY_FRACTION_MAX_LENGTH)); // opossite of transform
    }

    @HostListener("focusout")
    onFocusout() {
        console.log('onbur',this.ngControl.control.value);
        const val = this.currencyPipe.transform(this.ngControl.control.value, this.CURRENCY_FRACTION_MAX_LENGTH);
        // @ts-ignore
        // tslint:disable-next-line:triple-equals
        if (val && (val.replace(',', '') != 0)) {
            this.ngControl.control.setValue(val);
            this.onAmountFormat.emit(this.ngControl.control.value);
        } else {
            this.ngControl.control.setValue(undefined);
            this.onAmountFormat.emit(undefined);
        }
    }

    @HostListener("keydown", ["$event"])
    onKeydown(evt) {
        console.log('keydown', evt);
        if (evt.key === '.') {
            if (this.el.value.includes('.')) {
                evt.preventDefault(); // if dot('.') is already entered dont allow 2nd time
            }
            return; // dot('.') is first time entered its Ok
        }
        const key = !evt.charCode ? evt.which : evt.charCode;
        if (key === 8) {
            return; // allow backspace8
        }
        this.checkForLength(evt);
    }

    private checkForLength(evt) {
        const [integer, fraction = ""] = (this.el.value || "").toString().split('.');
        const dotPos = this.el.value.indexOf(".");
        const cursorPos = evt.target.selectionStart;
        if (dotPos === -1 || dotPos >= cursorPos) {
            if (integer.length >= this.CURRENCY_INT_MAX_LENGTH) {
                console.log("return from maxWholeNumber");
                evt.preventDefault(); // Dont type current key
            }
        } else if (fraction.length >= this.CURRENCY_FRACTION_MAX_LENGTH) {
            console.log("return from deciNoNumber");
            evt.preventDefault(); // Dont type current key
        }
    }

    @HostListener('paste', ['$event']) blockPaste(e: KeyboardEvent) {
        e.preventDefault();
    }
}
