import { Pipe, PipeTransform } from '@angular/core';
import {TranslatePipe} from "@ngx-translate/core";
import {appConstants} from "../../appConstants";

@Pipe({
  name: 'apsTraslate'
})
export class ApsTraslatePipe implements PipeTransform {

  constructor(private translate: TranslatePipe) {}
  transform(value: any, ...args: any[]): any {
    if (!value) {
      return;
    }
    let label = "lbl_" + value.replace(/\s/g, "_");
    label = label.toLowerCase();
    const translatedKey = this.translate.transform(label);
    if (translatedKey === label) {
      appConstants.TEMP_VAR.push(`"${label}" : "${value}"#`);
    }
    return value;
  }

}
