import {Injectable} from "@angular/core";
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree} from "@angular/router";
import {Observable} from "rxjs";
import {ListingService} from "src/app/listing/listing.service";

@Injectable({providedIn: 'root'})
export class BillPaymentUploadDetailsListingGuard implements CanActivate {

  constructor(private listingService: ListingService, private router: Router) {}

  // tslint:disable-next-line:max-line-length
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
    const params = route.params.id;
    if (this.listingService.currentListType &&
        (this.listingService.currentListType.key === "REJECTLIST"
        || this.listingService.currentListType.key === "PENDINGLIST")) {
      this.router.navigate(['/menu/paypro/billPayementUploadTransactionLevelList', params]);
      return false;
    }
    return true; 
  }
}
