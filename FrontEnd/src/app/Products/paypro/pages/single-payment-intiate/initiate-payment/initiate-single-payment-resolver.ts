import {Injectable} from "@angular/core";
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from "@angular/router";
import {EMPTY, Observable, of} from "rxjs";
import {SinglePaymentService} from "../single-payment.service";
import {ObjTransferService} from "../../../../../services/aps-services/obj-transfer.service";

@Injectable({ providedIn: 'root' })
export class InitiateSinglePaymentResolver implements Resolve<any> {
    constructor(private service: SinglePaymentService,
                private objTransSrv: ObjTransferService) {}

    resolve(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<any>|Promise<any>|any {
        const editData = this.objTransSrv.getObjData('editData');
        if (editData) {
            return this.service.view({dataMap: {id: editData.id}});
        }
        return of(null);
    }
}
