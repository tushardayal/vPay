import { Component, OnInit } from '@angular/core';
import {LpoppService} from "../lpopp.service";
import {ActivatedRoute, Router} from "@angular/router";
import {ObjTransferService} from "../../../../../services/aps-services/obj-transfer.service";

@Component({
    selector: 'app-instituition-types',
    templateUrl: './instituition-types.component.html',
    styleUrls: ['./instituition-types.component.scss'],
})
export class InstituitionTypesComponent implements OnInit {

    institutionTypeList$;

    constructor(public lpoppService: LpoppService,
                private route: ActivatedRoute,
                private objTransSrv: ObjTransferService,
                private router: Router) { }

    ngOnInit() {
        const stateData = this.objTransSrv.getObjData('state');
        if (stateData) {
            this.lpoppService.pageTitle = stateData.page.displayName;
        }
        this.institutionTypeList$ = this.lpoppService.institutionTypeList$;
    }

    doRefresh($event: any) {
        this.lpoppService.getInstitutionTypes();
    }

    onItemClickFunc(institution: any, $event: MouseEvent) {
        this.lpoppService.lpoppData.institutionType = institution.id;
        this.lpoppService.lpoppData.institutionTypeValue = institution.displayName;
        this.router.navigate(['../lpopp-initiate'], {relativeTo: this.route});
    }
}
