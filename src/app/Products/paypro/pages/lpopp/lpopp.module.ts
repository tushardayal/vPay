import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import {IonicModule} from '@ionic/angular';

import {LpoppPageRoutingModule} from './lpopp-routing.module';

import {LpoppPage} from './lpopp.page';
import {TextAvatarModule} from "../../../../directives/text-avatar";
import {TranslateModule} from "@ngx-translate/core";
import {LpoppModalComponent} from "./lpopp-modal/lpopp-modal.component";
import {SharedModule} from "../../../../components/shared.module";
import {SLCPComponent} from "./institution/slcp/slcp.component";
import {InstituitionTypesComponent} from "./instituition-types/instituition-types.component";
import {IRDPComponent} from "./institution/irdp/irdp.component";
import {IrdpFormComponent} from "./search-form/irdp-form/irdp-form.component";
import {DetListingComponent} from "./template/det-listing/det-listing.component";
import {SlpapFormComponent} from "./search-form/slpap-form/slpap-form.component";
import {SLPAPComponent} from "./institution/slpap/slpap.component";
import {EPFPComponent} from "./institution/epfp/epfp.component";
import {EpfpFormComponent} from "./search-form/epfp-form/epfp-form.component";
import {EpfpViewComponent} from "./institution/epfp/epfp-view/epfp-view.component";
import {IrdpViewComponent} from "./institution/irdp/irdp-view/irdp-view.component";
import {SlcpViewComponent} from "./institution/slcp/slcp-view/slcp-view.component";
import {SlpapViewComponent} from "./institution/slpap/slpap-view/slpap-view.component";
import {LpoppCommonViewComponent} from "./institution/lpopp-common-view/lpopp-common-view.component";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        LpoppPageRoutingModule,
        TextAvatarModule,
        TranslateModule,
        SharedModule,
        ReactiveFormsModule
    ],
    declarations: [LpoppPage, LpoppModalComponent, SLCPComponent,
        InstituitionTypesComponent, IRDPComponent, IrdpFormComponent,
        SlpapFormComponent, SLPAPComponent, EPFPComponent,
        DetListingComponent, EpfpFormComponent,
        EpfpViewComponent, IrdpViewComponent, SlcpViewComponent, SlpapViewComponent,
        LpoppCommonViewComponent
    ],
    exports: [
        EpfpViewComponent,
        IrdpViewComponent,
        SlcpViewComponent,
        SlpapViewComponent,
        LpoppCommonViewComponent
    ],
    entryComponents: [LpoppModalComponent]
})
export class LpoppPageModule {}
