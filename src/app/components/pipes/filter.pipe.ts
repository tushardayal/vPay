import { Pipe, PipeTransform } from "@angular/core";
import * as _ from "lodash";
@Pipe({
  name: "filterBy",
})
export class FilterByPipe implements PipeTransform {

  transform(input, props, search = '', strict = false) {
    if (!Array.isArray(input) ||
        (!Array.isArray(search) && !this.isString(search) && !this.isNumberFinite(search) && !this.isBoolean(search))) {
        return input;
    }
    const terms = String(search)
        .toLowerCase()
        .split(',');
    return input.filter(obj => {
        return props.some(prop => {
            return terms.some(term => {
                const value = this.extractDeepPropertyByMapKey(obj, prop);
                /* tslint:disable */
                const { props, tail } = this.extractDeepPropertyByParentMapKey(obj, prop);
                if (this.isUndefined(value) && !this.isUndefined(props) && Array.isArray(props)) {
                    return props.some(parent => {
                        const str = String(parent[tail]).toLowerCase();
                        return strict ? str === term : !!~str.indexOf(term);
                    });
                }
                if (this.isUndefined(value)) {
                    return false;
                }
                const strValue = String(value).toLowerCase();
                return strict ? term === strValue : !!~strValue.indexOf(term);
            });
        });
    });
}
isNumberFinite(value) {
  return typeof(value) === "number" && isFinite(value);
}
isString(value) {
  return typeof(value) ==="string";
}
isBoolean(value) {
  return typeof(value) === "boolean";
}
extractDeepPropertyByMapKey(obj, map) {
  const keys = map.split('.');
  const head = keys.shift();
  return keys.reduce((prop, key) => {
      return !this.isUndefined(prop) && !this.isNull(prop) && !this.isUndefined(prop[key]) ? prop[key] : undefined;
  }, obj[head || '']);
}
isUndefined(value) {
  return typeof value === 'undefined';
}
isNull(value) {
  return value === null;
}
isFunction(value) {
  return typeof value === 'function';
}
extractDeepPropertyByParentMapKey(obj, map) {
  const keys = map.split('.');
  const tail = keys.pop();
  const props = this.extractDeepPropertyByMapKey(obj, keys.join('.'));
  return { props, tail };
}
}
