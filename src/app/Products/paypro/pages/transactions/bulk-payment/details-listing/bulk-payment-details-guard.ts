import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from "@angular/router";
import { Observable } from "rxjs";
import { ListingService } from "src/app/listing/listing.service";
import {ObjTransferService} from "../../../../../../services/aps-services/obj-transfer.service";

@Injectable({ providedIn: 'root' })
export class bulkPaymentDetailsListingGuard implements CanActivate  {

  parentListingType;
  constructor(private listingService: ListingService, private router: Router) {
  }
  canActivate(route: ActivatedRouteSnapshot,
              state: RouterStateSnapshot): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
    const params =  route.params.id;

    if (this.parentListingType !== "PENDINGLIST") {
      this.router.navigate(['/menu/paypro/bulkPayementDetailsReview', params]);
      return false;
    }
    return true;
  }
}
