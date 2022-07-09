import {Component, OnInit} from '@angular/core';
import {Subject} from "rxjs";
import {ActivatedRoute, Router} from "@angular/router";
import {map, shareReplay, takeUntil} from "rxjs/operators";
import {TreasuryService} from "../treasury.service";
import {ModalController} from "@ionic/angular";
import {AddNewWidgetComponent} from "../../../../../dashboard/add-new-widget/add-new-widget.component";
import {ViewDealComponent} from "../view-deal/view-deal.component";

@Component({
    selector: 'app-product-details',
    templateUrl: './product-details.component.html',
    styleUrls: ['./product-details.component.scss'],
})
export class ProductDetailsComponent implements OnInit {
    unsub$ = new Subject();
    productDetails: any;
    productKey;
    constructor(private trasuryService: TreasuryService,
                private router: Router,
                private modalCtrl: ModalController,
                private route: ActivatedRoute) {}

    ngOnInit() {
        this.route.paramMap.pipe(takeUntil(this.unsub$))
            .subscribe(val => {
                const id = val.get("id");
                this.productKey = id;
                this.trasuryService.getProductDetailsList(id)
                    .pipe(
                        shareReplay(),
                        map(response => response.productDetails.length > 0 ? response.productDetails[0] : undefined)
                    )
                    .subscribe(response => this.productDetails = response);
            });
    }

    onClickLinks(item) {
        window.open(item.value, '_system');
    }
    toggleGroup(group: any) {
        if (event) {
            event.stopPropagation();
        }
        group.show = !group.show;
    }

    async showDeal($event, index: any, product) {
        if (this.productKey !== "2" || index !== 8 || product[0].value !== 'FXSWAP') {
            return;
        }
        $event.stopPropagation();
        const modal = await this.modalCtrl.create({
            component: ViewDealComponent,
            componentProps: {
                data: product[11],
            },
        });
        /*modal.onDidDismiss().then(() => {});*/
        return await modal.present();
    }
}
