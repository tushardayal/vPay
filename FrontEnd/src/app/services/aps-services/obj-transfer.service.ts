import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ObjTransferService {

  private objData: any = {};
  constructor() {
    console.log("inside objsrv2 ", this.objData);
  }
  setObjData(key, data) {
    this.objData[key] = data;
  }
  getObjData(key) {
    return this.objData[key];
  }
  clearObjData() {
    this.objData = {};
  }
  removeObj(key) {
    delete this.objData[key];
  }
}
