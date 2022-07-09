import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {FormBuilder, FormGroup, NgForm, Validators} from "@angular/forms";
import {AngularAjaxService} from "../../../../../../services/aps-services/ajaxService/angular-ajax.service";
import {LpoppService} from "../../lpopp.service";
import {GeneralService, LoadingStatus} from "../../../../../../services/general.service";
import {environment} from "../../../../../../../environments/environment";

@Component({
  selector: 'app-det-listing',
  templateUrl: './det-listing.component.html',
  styleUrls: ['./det-listing.component.scss'],
})
export class DetListingComponent implements OnInit {

    lpoppRequestDetObj;
    selectedChild: any;
    childForm: FormGroup;
    environment = environment;
    constructor(private formBuilder: FormBuilder,
                private angularAjxService: AngularAjaxService,
                private generalService: GeneralService,
                public lpoppService: LpoppService) {
    }

    ngOnInit() {
        this.lpoppService._lodingDetObj
            .subscribe((loadingStatus: LoadingStatus) => {
                if (loadingStatus === LoadingStatus.COMPLETE) {
                    this.lpoppRequestDetObj = this.lpoppService.lpoppRequestDetObj;
                    console.log(this.lpoppRequestDetObj);
                    if (this.lpoppService.institutionType === 'IRDP') {
                        this.createChildForm();
                    }
                }
            });
    }

    private createChildForm() {
        // tslint:disable-next-line:forin
        for (const data of this.lpoppRequestDetObj.dataList) {
            // this.childForm = this.formBuilder.group({
            data.childForm = this.formBuilder.group({
                taxPaymentAmount: [null, this.lpoppService.lpoppDetailData.paymentType !== 'NONSELFASSESSED'
                    ? [Validators.required, Validators.pattern(this.lpoppService.amountRgx)]
                    : [Validators.pattern(this.lpoppService.amountRgx)]],
                penaltyAmount: [null, Validators.pattern(this.lpoppService.amountRgx)],
                interestAmount: [null, Validators.pattern(this.lpoppService.amountRgx)],
            }, {validators: this.generalService.atLeastOneValidator});
        }
    }

    onClickListingSel(data, event, index) {
        if (event.target.value === data.selected) {
            delete data.selected;
        }

        const listingObj =  this.lpoppRequestDetObj;
        const editableIndex = [];
        /*listingObj.headers.map((header, headerIndex) => {
            if (header.isEditable === 'Y') {

            }
        });*/
        for (const headerIndex in listingObj.headers) {
            if (listingObj.headers[headerIndex].isEditable === 'Y') {
                editableIndex.push(headerIndex);
            }
        }
        for (const data1 of listingObj.dataList) {
            if (data1.selected !== 'Y') {
                for (const editIndex of editableIndex) {
                    data1[editIndex] = undefined;
                }
            }
        }

        if (this.lpoppService.singleSelection) {
            for (const i in this.lpoppRequestDetObj.dataList) {
                if (i !== index) {
                    delete this.lpoppRequestDetObj.dataList[i].selected;
                }
            }
        }
        console.table(this.lpoppRequestDetObj.dataList);
        event.stopPropagation();
    }

    toggleGroup(event, group: any) {
        if (event) {
            event.stopPropagation();
        }
        group.show = !group.show;
    }

    getFormData() {
        const index = this.getSelectedChild();
        return this.lpoppRequestDetObj.dataList[index].childForm.value;
    }
    /*setTotalAmountData() {
        const childFormList = this.detFormList.toArray();
        for (const index in this.lpoppRequestDetObj.dataList) {
            if (this.lpoppRequestDetObj.dataList[index].selected === 'Y') {
                childFormList[index].setTotalAmountChild();
                if (this.lpoppService.singleSelection) {
                    break;
                }
            }
        }
    }*/


    setFinalData() {
        if (this.lpoppService.institutionType === 'IRDP') {
            const index = this.getSelectedChild();
            const childData = this.lpoppRequestDetObj.dataList[index].childForm;
            if (childData && childData.value) {
                Object.assign(this.lpoppService.lpoppDetailData, childData.value);
            }
        }
        this.lpoppService.modifyRequestDetListing(this.lpoppRequestDetObj);
        this.lpoppService.modifyRequestDetObj();
    }

    getSelectedChild() {
        return this.lpoppRequestDetObj.dataList.indexOf(this.selectedChild);
    }
    onDetRadioChange($event) {
        $event.stopPropagation();

        const index = this.getSelectedChild();

        this.lpoppRequestDetObj.dataList.map((data, i) => {
            if ((this.lpoppService.singleSelection === true && i === index)
                || (this.lpoppService.singleSelection === false && data.selected)) {
                data.selected = 'Y';
            } else {
                if (data.childForm) {
                    data.childForm.reset();
                }
                delete data.selected;
            }
        });
        console.log('onDetRadioChange');
    }

    /*onDetChange($event) {
        $event.stopPropagation();
        this.onDetRadioChange($event);
        console.log('onDetChange');
    }*/

    isCardValid(data, index, parentForm: NgForm): boolean {
        if (this.lpoppService.institutionType === 'IRDP') {
            this.lpoppService.disableSlide2.next(data.childForm.invalid);
            return data.childForm.valid;
        }
        this.lpoppService.disableSlide2.next(parentForm.invalid);
        return parentForm.valid;
    }
}
