import {Component, Input, OnInit} from "@angular/core";
import {TranslatePipe} from "@ngx-translate/core";

@Component({
    selector: "errorMsg",
    templateUrl: "./errorMsg.component.html",
    styleUrls: ["./errorMsg.component.scss"]
})
export class ErrorMsgComponent implements OnInit {
    @Input() control: any;
    @Input() errMsg: string;
    @Input() position: string;
    required = false;
    pattern = false;
    errPatternMsg: string;

    constructor(private traslatePipe: TranslatePipe) {
    }

    ngOnInit() {
        const extraText = this.traslatePipe.transform('lbl_please_enter');
        if (this.errMsg) {
            this.errPatternMsg = this.errMsg.replace(extraText, '');
        }
        if (
            this.control &&
            this.control.validator &&
            this.control.validator(this.control)
        ) {
            this.required = this.control
                .validator(this.control)
                .hasOwnProperty("required");
        }
    }
}
