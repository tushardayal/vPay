import { Component, OnInit, Input, SimpleChanges, OnChanges, Output, EventEmitter } from "@angular/core";
import { ListingService } from 'src/app/listing/listing.service';
import { ActionSheetController } from '@ionic/angular';
import {takeUntil} from "rxjs/operators";
import { Subject } from 'rxjs';
import { TransactionCommonService } from 'src/app/Products/transaction-common.service';
import { TranslatePipe } from '@ngx-translate/core';
import {ActionUrls} from "../../Products/interfacaes/base-transaction";
@Component({
  selector: "app-authorize-reject-listing-btn",
  templateUrl: "./authorize-reject-listing-btn.component.html",
  styleUrls: ["./authorize-reject-listing-btn.component.scss"],
  providers: [TranslatePipe]
})
export class AuthorizeRejectListingBtnComponent implements OnInit {
  @Input() multiSelectMode: boolean;
  @Output() setSelectedListType = new EventEmitter<any>();
  @Input() isChildRecord: boolean;
  @Input() actionUrls: ActionUrls;
  avaliableLists: any[];
  selectedListType;
  listTypeBtns: any[];
  private unsubGenerateOTP$ = new Subject<void>();

  constructor(private listingService: ListingService,
              private actionSheetController: ActionSheetController,
              public transactionSrv: TransactionCommonService,
              ) {/*private translate: TranslatePipe*/
      console.log("inside constructor auth btns");
    }

  ngOnInit() {
    console.log("init constructor auth btns");
    // this.createListType();
  }

  createListType(selectedListType, avaliableLists) {
    this.avaliableLists = avaliableLists;
    this.selectedListType = selectedListType;
    console.log('create btn');
    this.listTypeBtns = [];
    for (const link of avaliableLists) {
      if (link.key === "INIT") {
        continue;
      }
      const btn = {
        text: link.displayName,
        icon: link.icon,
        cssClass:
          selectedListType.key === link.key ? "selected-list-type" : "",
        handler: () => {
          this.selectedListType = link;
          this.listingService.currentListType = link;
          for (const btn1 of this.listTypeBtns) {
            if (btn === btn1) {
              btn1.cssClass = "selected-list-type";
            } else {
              delete btn1.cssClass;
            }
          }
          this.setSelectedListType.emit(this.selectedListType);
          this.listingService.refreshTab();
        },
      };
      this.listTypeBtns.push(btn);
    }
    const cancel = {
      text: 'Cancel',
      icon: "close",
      role: "cancel",
      handler: () => {
        console.log("Cancel clicked");
      },
    };
    this.listTypeBtns.push(cancel);
  }

  async presentActionSheet() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Select',
      cssClass: "select-listing-action-sheet",
      buttons: this.listTypeBtns,
    });
    await actionSheet.present();
  }
  generateOTP() {
    return this.listingService.generateOTP().pipe(takeUntil(this.unsubGenerateOTP$));
  }
  authorize() {
    if (this.transactionSrv.isVerifierSelect) {
      this.transactionSrv.authorize(undefined, true, this.isChildRecord, this.actionUrls ? this.actionUrls.VERIFY : undefined);
    } else {
      // tslint:disable-next-line:max-line-length
      this.transactionSrv.authorize(undefined, false, this.isChildRecord, this.actionUrls ? this.actionUrls.AUTHORIZE : undefined);
    }
  }
  reject() {
    if (this.transactionSrv.isVerifierSelect) {
      this.transactionSrv.reject(undefined, true, this.isChildRecord, this.actionUrls ? this.actionUrls.DECLINE : undefined);
    } else {
      this.transactionSrv.reject(undefined, false, this.isChildRecord, this.actionUrls ? this.actionUrls.REJECT : undefined);
    }
  }

}
