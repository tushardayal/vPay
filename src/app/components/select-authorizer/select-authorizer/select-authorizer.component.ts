import {Component, OnInit, Input, ChangeDetectorRef, AfterContentChecked} from "@angular/core";
import { SelectAuthorizerService } from "./select-authorizer.service";
import { ModalController, NavController } from "@ionic/angular";
import { Router, NavigationEnd } from '@angular/router';
import {Observable, of} from "rxjs";

@Component({
  selector: "app-select-authorizer",
  templateUrl: "./select-authorizer.component.html",
  styleUrls: ["./select-authorizer.component.scss"],
})
export class SelectAuthorizerComponent implements OnInit, AfterContentChecked {
  @Input() inputData;
  authorizerData;
  selectorType;
  allChecked;
  matrixHeadersMap;
  usersMatrix: any = [];
  verifierList: any = [];
  selectedAuthorizerCount;
  selectAuthObj: any = {};
  selectedVerifierCount;
  displaySelectAuthScreen = false;
  displaySelectVerifierScreen = false;
  authSubmitted = false;
  verifierSubmitted = false;
  isLoading = false;
  reqProfilesObj: any = {};
  private selectedProfileObj: any = {};
  constructor(
    private selectAuthSrv: SelectAuthorizerService,
    private modalCtrl: ModalController,
    private ref: ChangeDetectorRef,
    private navCtrl: NavController,
  ) {
    console.log("SelectAuthorizerComponent", this.inputData);
  }

  ngOnInit() {
    console.log(this.inputData);
    if (this.inputData.dataFrom === "INIT") {
      this.selectAuthObj.getLink = this.inputData.getLink;
      this.selectAuthObj.setLink = this.inputData.setLink;
      this.selectAuthObj.selectorType = this.inputData.selectorType;
      this.selectAuthObj.recordListType = this.inputData.recordListType;
      if (
        this.inputData.submitResponse &&
        this.inputData.submitResponse.dataMap
      ) {
        this.selectAuthObj.referenceId = this.inputData.submitResponse.dataMap.referenceId;
        this.selectAuthObj.debitAccountId = this.inputData.submitResponse.dataMap.debitAccountId;
        this.selectAuthObj.corporateProductId = this.inputData.submitResponse.dataMap.corporateProductId;
      }
      if (this.inputData.submitResponse.dataMap.displaySelectAuthScreen) {
        this.displaySelectAuthScreen = true;
        this.selectorType = "SELECTAUTHORIZER";
        this.selectAuthObj.authLevel = this.inputData.submitResponse.dataMap.authLevel;
        this.getAuthorizerToSelect("SINGLE");
      }
      if (this.inputData.submitResponse.dataMap.displaySelectVerifierScreen) {
        this.displaySelectVerifierScreen = true;
        this.selectorType = "SELECTVERIFIER";
        this.selectAuthObj.verifierAuthLevel = this.inputData.submitResponse.dataMap.verifierAuthLevel;
        this.getVerifierToSelect("SINGLE");
      }
    } else if (this.inputData.dataFrom === "LISTING") {
      this.selectAuthObj.getLink = this.inputData.getLink;
      this.selectAuthObj.setLink = this.inputData.setLink;
      this.selectAuthObj.referenceId = this.inputData.id;
      this.selectAuthObj.debitAccountId = this.inputData.debitAccount;
      this.selectAuthObj.corporateProductId = this.inputData.corporateProductId;
      this.selectAuthObj.selectorType = this.inputData.selectorType;
      this.selectAuthObj.recordListType = this.inputData.recordListType;

      if (this.inputData.selectorType === "SELECTVERIFIER") {
        this.selectorType = "SELECTVERIFIER";
        this.displaySelectVerifierScreen = true;
        this.selectAuthObj.verifierAuthLevel = this.inputData.authorizationLevel;
        this.getVerifierToSelect("BULK");
      } else {
        this.selectorType = "SELECTAUTHORIZER";
        this.displaySelectAuthScreen = true;
        this.selectAuthObj.authLevel = this.inputData.authorizationLevel;
        this.getAuthorizerToSelect("BULK");
      }
    }
  }

  getVerifierToSelect(recordTypeData) {
    this.isLoading = true;
    if (this.selectAuthObj.selectorType === "SELECTVERIFIER") {
      if (
        this.selectAuthObj.verifierAuthLevel === "B" ||
        this.selectAuthObj.verifierAuthLevel === "T"
      ) {
        this.selectAuthObj.displaySelectVerifier = true;
      } else {
        this.selectAuthObj.displaySelectVerifier = false;
        return;
      }
    }

    if (!this.selectAuthObj.getLink || !this.selectAuthObj.getLink) {
      return;
    }

    this.verifierList = [];
    this.selectAuthObj.isVerifierSelected = false;

    const data = {
      dataMap: {
        authLevel: this.selectAuthObj.verifierAuthLevel,
        selectorType: "SELECTVERIFIER",
        referenceId: this.selectAuthObj.referenceId,
        debitAccountId: this.selectAuthObj.debitAccountId,
        corporateProductId: this.selectAuthObj.corporateProductId,
        recordType: recordTypeData,
        recordListType: this.selectAuthObj.recordListType,
      },
    };

    this.selectAuthSrv
      .getSelectAuthorizer({ data, getLink: this.selectAuthObj.getLink })
      .subscribe((reponse) => {
        this.isLoading = false;
        if (reponse && reponse.dataMap) {
          if (reponse.dataMap.selectorType === "SELECTVERIFIER") {
            this.selectAuthObj.isVerifierSelected = true;
            this.verifierList = reponse.dataMap.verifierList;
            if (this.selectAuthObj.isVerifierSelected && this.verifierList[0]) {
              this.selectAuthObj.verifierCount = this.verifierList[0][6];
              for (const verifier of this.verifierList) {
                if (verifier && verifier[7] === "Y") {
                  verifier.isChecked = true;
                } else {
                  verifier.isChecked = false;
                }
              }
            }
          }
        }
      });
  }
  getAuthorizerToSelect(recordTypeData) {
    this.isLoading = true;
    if (
      this.selectAuthObj.authLevel === "B" ||
      this.selectAuthObj.authLevel === "T"
    ) {
      this.selectAuthObj.displaySelectAuth = true;
    } else {
      this.selectAuthObj.displaySelectAuth = false;
      return;
    }

    if (!this.selectAuthObj.getLink || !this.selectAuthObj.getLink) {
      return;
    }

    this.matrixHeadersMap = {};
    this.usersMatrix = [];
    this.selectAuthObj.isAuthSelecter = false;
    const data = {
      dataMap: {
        authLevel: this.selectAuthObj.authLevel,
        selectorType: "SELECTAUTHORIZER",
        referenceId: this.selectAuthObj.referenceId,
        debitAccountId: this.selectAuthObj.debitAccountId,
        corporateProductId: this.selectAuthObj.corporateProductId,
        recordType: recordTypeData,
        recordListType: this.selectAuthObj.recordListType,
      },
    };

    this.selectAuthSrv
      .getSelectAuthorizer({ data, getLink: this.selectAuthObj.getLink })
      .subscribe((reponse) => {
        this.isLoading = false;
        if (reponse && reponse.dataMap) {
          if (reponse.dataMap.selectorType === "SELECTAUTHORIZER") {
            this.matrixHeadersMap = reponse.dataMap.matrixHeadersMap;
            this.usersMatrix = reponse.dataMap.usersMatrix;
            this.selectAuthObj.isAuthSelecter = true;
            if (this.matrixHeadersMap && this.selectAuthObj.isAuthSelecter) {
              // tslint:disable-next-line: forin
              for (const index in this.matrixHeadersMap) {
                this.selectAuthObj.profileCountStr =
                  index + "(" + this.matrixHeadersMap[index] + ")" + ", ";
              }
              this.selectAuthObj.profileCountStr = this.selectAuthObj.profileCountStr.substring(
                0,
                this.selectAuthObj.profileCountStr.lastIndexOf(",")
              );
            }
            if (this.selectAuthObj.isAuthSelecter && this.usersMatrix[0]) {
              // tslint:disable-next-line: forin
              for (const matrix of this.usersMatrix) {
                if (matrix[7] === "Y") {
                  matrix.isChecked = true;
                } else {
                  matrix.isChecked = false;
                }
              }
            }

            // tslint:disable-next-line:forin
            for (const key in this.matrixHeadersMap[2]) {
              const profilesObj = this.matrixHeadersMap[2][key];
              for (const obj in profilesObj) {
                if (!this.reqProfilesObj[obj] && profilesObj[obj]) {
                  this.reqProfilesObj[obj] = +profilesObj[obj];
                } else if (this.reqProfilesObj[obj] && profilesObj[obj] && (this.reqProfilesObj[obj] < profilesObj[obj])) {
                  this.reqProfilesObj[obj] = +profilesObj[obj];
                }
              }
            }
          }
        }
      });
  }
  closeModal() {
    this.modalCtrl.dismiss();
    if (this.inputData.navigateLink) {
      this.navCtrl.navigateRoot(this.inputData.navigateLink);
    }
  }
  validateSelectAuth() {
    let isNotValidate = true;
    if (this.matrixHeadersMap) {
      for (const key in this.matrixHeadersMap[2]) {
        let profilesObj = {};
        this.selectedProfileObj = {};
        profilesObj = this.matrixHeadersMap[2][key];

        this.selectedAuthorizerCount = 0;
        if (this.usersMatrix && this.usersMatrix.length > 0) {
          for (const matrix of this.usersMatrix) {
            if (matrix.isChecked === true) {
              this.selectedProfileObj[matrix[3]] = this.selectedProfileObj[matrix[3]]
                ? this.selectedProfileObj[matrix[3]] + 1
                : 1;
              this.selectedAuthorizerCount++;
              isNotValidate = false;
            }
          }
        }
        // tslint:disable-next-line: forin
        for (const obj in profilesObj) {
          if (!this.selectedProfileObj[obj]) {
            isNotValidate = true;
            break;
          }
          if (+profilesObj[obj] !== this.selectedProfileObj[obj]) {
            isNotValidate = true;
            break;
          }
        }
        if (!isNotValidate) {
          return isNotValidate;
        }
      }
    }
    return isNotValidate;
  }

  validateSelectVerifier() {
    let isNotValidate = true;
    let count = 0;
    if (this.verifierList && this.verifierList.length > 0) {
      for (const verifier of this.verifierList) {
        if (verifier.isChecked === true) {
          isNotValidate = false;
          count++;
        }
      }
    }
    this.selectedVerifierCount = count;
    if (+this.selectAuthObj.verifierCount !== count) {
      isNotValidate = true;
    }
    return isNotValidate;
  }

  submitSelectAuth(isSubmitAll?) {
    const authorizersList = [];
    if (!isSubmitAll && this.usersMatrix && this.usersMatrix.length > 0) {
      for (const matrix of this.usersMatrix) {
        if (matrix.isChecked === true) {
          authorizersList.push(matrix[0] + "," + matrix[2]);
        }
      }
    }
    const data = {
      dataMap: {
        authorizersList,
        selectorType: "SELECTAUTHORIZER",
      },
    };
    this.submit(data);
  }

  submitSelectVerifier(isSubmitAll?) {
    const verifierList = [];
    if (this.verifierList && this.verifierList.length > 0) {
      for (const verifier of this.verifierList) {
        if (verifier.isChecked === true) {
          verifierList.push(verifier[3]);
        }
      }
    }
    const data = {
      dataMap: { verifierList, selectorType: "SELECTVERIFIER" },
    };
    this.submit(data);
  }

  submit(data) {
    if (data.dataMap.selectorType === "SELECTVERIFIER") {
      data.dataMap.authLevel = this.selectAuthObj.verifierAuthLevel;
    } else {
      data.dataMap.authLevel = this.selectAuthObj.authLevel;
    }
    data.dataMap.referenceId = this.selectAuthObj.referenceId;
    data.dataMap.recordListType = this.selectAuthObj.recordListType;

    this.selectAuthSrv
      .setSelectAuthorizer({ setLink: this.selectAuthObj.setLink, data })
      .subscribe((res) => {
        if (this.inputData.dataFrom === 'INIT') {
          console.log('submit success', data);
          if (data.dataMap.selectorType === 'SELECTAUTHORIZER') {
            this.authSubmitted = true;
            this.displaySelectAuthScreen = false;
            this.selectorType = 'SELECTVERIFIER';
          }
          if (data.dataMap.selectorType === 'SELECTVERIFIER') {
            this.verifierSubmitted = true;
            this.displaySelectVerifierScreen = false;
            this.selectorType = 'SELECTAUTHORIZER';
          }
          if (!this.displaySelectVerifierScreen && !this.displaySelectAuthScreen) {
            this.modalCtrl.dismiss();
            this.navCtrl.navigateRoot(this.inputData.navigateLink);
          }
        } else {
          this.modalCtrl.dismiss();
        }
      });
  }

  selectAllUsers(isChecked, list) {
    // tslint:disable-next-line: forin
    for (const i in list) {
      list[i]["isChecked"] = !isChecked;
    }
  }
  checkedUser(checked, list) {
    if (checked) {
      this.allChecked = false;
    }
    if (!checked) {
      let allSelected = true;
      // tslint:disable-next-line: forin
      for (const i in list) {
        if (list[i]["isChecked"] === false) {
          allSelected = false;
        }
      }
      if (allSelected) {
        this.allChecked = true;
      }
    }
  }

  validateAuthSlab(item: any): Observable<boolean> {
    if (!this.reqProfilesObj[item[3]]) {
      return of(true);
    }

    if (!this.selectedProfileObj[item[3]]) {
      return of(false);
    }

    if (this.reqProfilesObj[item[3]] > this.selectedProfileObj[item[3]]) {
      return of(false);
    } else {
      return of(true);
    }
  }
  // tslint:disable-next-line:use-lifecycle-interface
  ngAfterContentChecked() {
    this.ref.detectChanges();
  }

}
