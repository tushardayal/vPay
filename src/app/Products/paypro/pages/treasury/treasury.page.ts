import {Component, OnDestroy, OnInit} from '@angular/core';
import {TreasuryService} from "./treasury.service";
import {Observable, Subject} from "rxjs";
import {map, shareReplay, takeUntil} from "rxjs/operators";
import {ActivatedRoute, Router} from "@angular/router";
import {UserService} from "../../../../services/aps-services/user.service";
import {environment} from "../../../../../environments/environment";
import {ObjTransferService} from "../../../../services/aps-services/obj-transfer.service";

@Component({
  selector: 'app-treasury',
  templateUrl: './treasury.page.html',
  styleUrls: ['./treasury.page.scss'],
})
export class TreasuryPage implements OnInit, OnDestroy {

  productData: any;
  unSub$ = new Subject();
  environment = environment;
  newsFlash;

    constructor(public trasuryService: TreasuryService,
                private router: Router,
                public userService: UserService,
                private objTransSrv: ObjTransferService,
                private route: ActivatedRoute) {
      try {
        const menuData = this.objTransSrv.getObjData('state').page;
        this.newsFlash  = menuData.menuLinksDetail.link.find(o => o.key === "NEWSFLASH");
      } catch (e) {
        console.error(e);
      }
    }

  ngOnInit() {
    console.log('### ', this.objTransSrv.getObjData('state').page);
    if (this.userService.isGroupSelected) {
      this.trasuryService.getApplicant();
    } else {
      this.getProductList();
    }
  }

  getProductList() {
    this.trasuryService.getProductList()
        .pipe(takeUntil(this.unSub$))
        .subscribe(response => {
          this.productData = response;
        });
  }

  getProductDetailsList(product) {
    this.trasuryService.getProductDetailsList(product.productKey);
  }

  getToDetailsList(product) {
      this.router.navigate(["../product-details" , product.productKey], {relativeTo: this.route});
    // this.trasuryService.getProductDetailsList(product.productKey);
  }

  ngOnDestroy(): void {
    this.unSub$.next();
    this.unSub$.complete();
  }

  openNewsFlash() {
    this.trasuryService.getNewsFlashLink()
        .pipe(takeUntil(this.unSub$), map(a => a.dataMap.newsFlashLink))
        .subscribe(response => window.open(response, '_system'));
  }
}
