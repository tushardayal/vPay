import { Pipe, PipeTransform } from '@angular/core';
import * as _ from 'lodash';


@Pipe({
  name: 'orderBy'
})
export class OrderByPipe implements PipeTransform {

  transform(array: Array<any>, ...args: any[]): any {

      const trueValues = [];
      const falseValues = [];
      // tslint:disable-next-line: forin
      for (const i in array) {
        if (array[i][args[0]]) {
          trueValues.push(array[i]);
        } else {
          falseValues.push(array[i]);
        }
      }
      return [...trueValues, ...falseValues];
  }

}
