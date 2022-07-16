import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {IonicModule} from '@ionic/angular';
import {AgmCoreModule} from '@agm/core';

import {ApsLoginLayout1Page} from "../login/login-layout-1/aps-login-layout1-page.component";
// import {ApsLoginLayout2Page} from "../login/login-layout-2/aps-login-layout2-page.component";
import {SideFilterComponent} from "./side-filter/side-filter.component";
import { FilterByPipe } from "./pipes/filter.pipe";
import {WizardLayout1Page} from "./wizard/wizard-layout-1/wizard-layout-1.page";
import {SlideItemActionsComponent } from '../directives/slide-item-actions/slide-item-actions.component';
import { ListingSkeletonComponent } from '../directives/listing-skeleton/listing-skeleton.component';
import { AuthorizeRejectListingBtnComponent } from '../directives/authorize-reject-listing-btn/authorize-reject-listing-btn.component';
import { ScrollModule } from './alpha-scroll/modules/alpha-scroll.module';
import { AlphaScroll } from './alpha-scroll/modules/alpha-scroll';
import { CurrencyFormatPipe } from './pipes/currency-format-pipe.pipe';
import {CurrencyFormatDirective} from "../directives/currency-format.directive";
import {OrderByPipe} from "./pipes/order-by.pipe";
import { ErrorMsgComponent } from './errorMsg/errorMsg.component';
import { SelectAuthorizerComponent } from './select-authorizer/select-authorizer/select-authorizer.component';
import {NoRecordFoundComponent} from "./no-record-found/no-record-found.component";
import { AnimateItemsDirective } from '../directives/animate-items.directive';
import { BicCodeSearchComponent } from './bic-code-search/bic-code-search.component';
import { MakerCheckerDetailsComponent } from '../directives/maker-checker-details/maker-checker-details.component';
import { TransactionCommonService } from '../Products/transaction-common.service';
import { MoreActionsPopoverComponent } from '../directives/slide-item-actions/moreActionsPopover/more-actions-popover.component';
import { TranslateModule } from '@ngx-translate/core';
import { HelpModalComponent } from './help-page/help-modal/help-modal.component';
import { HelpPageService } from './help-page/help-page.service';
import { InputTextFormatDirective } from '../directives/input-text-format.directive';
import {ViewAuthRemarksComponent} from "./view-auth-remarks/view-auth-remarks.component";
import {HelpPageDirective} from "./help-page/help-page.directive";
import {ApsTraslatePipe} from "./pipes/aps-traslate.pipe";
import {FileUploadComponent} from "./file-upload/file-upload.component";
import {StyleAmountDirective} from "../directives/style-amount.directive";
import {InputFieldValidationDirective} from "../directives/input-field-validation.directive";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        ScrollModule, TranslateModule,
        AgmCoreModule.forRoot({apiKey: ''})
    ],
    declarations: [
        ApsLoginLayout1Page,
        // ApsLoginLayout2Page,
        SideFilterComponent,
        FilterByPipe,
        ApsTraslatePipe,
        WizardLayout1Page,
        SlideItemActionsComponent,
        ListingSkeletonComponent,
        AuthorizeRejectListingBtnComponent,
        CurrencyFormatPipe,
        CurrencyFormatDirective,
        OrderByPipe,
        ErrorMsgComponent,
        SelectAuthorizerComponent,
        NoRecordFoundComponent,
        AnimateItemsDirective,
        BicCodeSearchComponent,
        MakerCheckerDetailsComponent,
        MoreActionsPopoverComponent,
        FileUploadComponent,
        HelpModalComponent,
        InputTextFormatDirective,
        ViewAuthRemarksComponent,
        HelpPageDirective,
        StyleAmountDirective,
        InputFieldValidationDirective
    ],
    exports: [
        ApsLoginLayout1Page,
        // ApsLoginLayout2Page,
        SideFilterComponent,
        FilterByPipe,
        WizardLayout1Page,
        SlideItemActionsComponent,
        ListingSkeletonComponent,
        AuthorizeRejectListingBtnComponent,
        AlphaScroll,
        CurrencyFormatPipe,
        CurrencyFormatDirective,
        OrderByPipe,
        ErrorMsgComponent,
        SelectAuthorizerComponent,
        NoRecordFoundComponent,
        AnimateItemsDirective,
        BicCodeSearchComponent,
        MakerCheckerDetailsComponent,
        MoreActionsPopoverComponent,
        HelpModalComponent,
        InputTextFormatDirective,
        ViewAuthRemarksComponent,
        HelpPageDirective,
        ApsTraslatePipe,
        FileUploadComponent,
        StyleAmountDirective,
        InputFieldValidationDirective
    ],
    providers: [OrderByPipe, FilterByPipe, TransactionCommonService, HelpPageService, ApsTraslatePipe],
    entryComponents: [SelectAuthorizerComponent, MoreActionsPopoverComponent, HelpModalComponent, ViewAuthRemarksComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class SharedModule {
}
