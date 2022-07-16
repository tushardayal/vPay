import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree} from '@angular/router';
import {Observable} from 'rxjs';
import {UserService} from "../../../../services/aps-services/user.service";

@Injectable({
  providedIn: 'root'
})
export class AccountSummaryGuard implements CanActivate {
  constructor(private router: Router,
              private userService: UserService) {}
  // tslint:disable-next-line:max-line-length
    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      return new Promise((resolve, reject) => {
        if (this.userService.isGroupSelected && !route.params.showSummary) {
            this.router.navigate(['menu/paypro/account-summary/group-summary']);
            resolve(false);
        } else {
            resolve(true);
        }
      });
    }
}
