import { Injectable } from '@angular/core';
import {FormControl} from "@angular/forms";
import {appConstants} from "../appConstants";
import {ToastService} from "./aps-services/toast-service";

@Injectable({
  providedIn: 'root'
})
export class FileValidatorService {

  constructor(private toastService: ToastService) { }


  validateFile(supportingDocEnrich) {
    return (control: FormControl) => {
      const file = control.value;
      const supportingDocFileExt = supportingDocEnrich.supportingDocFileExt;
      const supportingDocFileSize = supportingDocEnrich.supportingDocFilesize;
      if ( file && (this.checkFileExt(file, supportingDocFileExt) || this.checkFilesSize(file, supportingDocFileSize))) {
        this.toastService.presentToast('Invalid File');
        return {invalidFile: true};
      }
      return null;
    };
  }

  checkFileExt(fileData, supportingDocFileExt) {
    let invalid = false;
    if (fileData.name) {
      let ext = fileData.name.split('.').pop();
      ext = ext.toLowerCase();
      if (supportingDocFileExt) {
        const dataExt = supportingDocFileExt.toLowerCase();

        if (!(dataExt.indexOf(ext) > -1)) {
          invalid = true;
        }
      } else {
        if (!(appConstants.ALLOWED_SUPPORT_DOC_FILES.indexOf(ext) > -1)) {
          invalid = true;
        }
      }
    } else {
      invalid = true;
    }
    return invalid;
  }

  checkFilesSize(fileData, supportingDocFilesize) {
    let invalidFileSize = false;
    if (fileData.size && supportingDocFilesize) {
      const allowedSize = parseInt(supportingDocFilesize);
      if (allowedSize < (fileData.size * 0.001)) {
        invalidFileSize = true;
      }
    }
    return invalidFileSize;
  }
}
