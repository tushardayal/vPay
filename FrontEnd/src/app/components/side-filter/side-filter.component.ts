import {Component, EventEmitter, Input, OnInit, Output, ViewChild, SimpleChanges, OnChanges} from '@angular/core';
import * as _ from "lodash";
import {MenuController} from "@ionic/angular";
import {UserService} from "../../services/aps-services/user.service";
import {DatePipe} from "@angular/common";
import { ToastService } from 'src/app/services/aps-services/toast-service';
import { NgForm } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import {environment} from "../../../environments/environment";

@Component({
  selector: 'app-side-filter',
  templateUrl: './side-filter.component.html',
  styleUrls: ['./side-filter.component.scss'],
  providers: [TranslatePipe]
})
export class SideFilterComponent implements OnInit {

  @Input() filters: any[];

  @Output() applyFilter = new EventEmitter();
  @Output() changeSelectFilter = new EventEmitter<any>();

  @ViewChild('filterForm', {static: false}) public filterForm: NgForm;
  currentDate;
  maxYear;
  minYear;
  errorFlag;
  environment = environment;
  currentDate1: string;
  constructor(private menuCtrl: MenuController,
              private userService: UserService,
              private datePipe: DatePipe,
              private tostSrv: ToastService,
              private translate: TranslatePipe
  ) { }

  ngOnInit() {
    // console.log('filters', this.filters);
    // console.log('curremt Date ', this.userService.getUserDetails().moduleDetails.Payments.currentDate);
    if (this.userService.getSelectedProduct() === 'ImportTrade' || this.userService.getSelectedProduct() === 'ExportTrade') {
      this.currentDate = this.userService.getUserDetails().moduleDetails.Trade.currentDate;
    } else if (this.userService.getSelectedProduct() === 'Payments') {
      this.currentDate = this.userService.getUserDetails().moduleDetails.Payments.currentDate;
    }
    this.maxYear = (new Date(this.currentDate).getFullYear() + 10).toString();
    this.minYear = (new Date(this.currentDate).getFullYear() - 10).toString();
    // console.log('maxYear ', this.maxYear);
    this.currentDate1 = new Date(this.currentDate).toISOString();
    this.errorFlag = true;
  }

  applyFilterClick() {

    this.filterForm.form.markAllAsTouched();
    if (this.filterForm.form.status !== "INVALID") {
      const filters = [];
      for (const element of this.filters) {
        if (element.type === 'Date') {
          delete element.tempDateFlag;
        }
        if (element.value !== undefined && element.value !== null && element.value !== '') {
            filters.push(element);
        } else if (element.childFilters !== undefined) {
          if (element.type === 'amount' || element.type === 'Amount') {
            for (const obj of element.childFilters) {
              if (obj.value !== undefined && obj.value !== null && obj.value !== "") {
                const startAmounts = parseFloat(element.childFilters[0].value.replace(/,/g, ""));
                const endAmounts = parseFloat(element.childFilters[1].value.replace(/,/g, ""));
                if (startAmounts > endAmounts) {
                  const amountValid = this.translate.transform("end_amount_should_be_grater_than_start_amount");
                  this.tostSrv.presentToast(amountValid);
                  return;
                } else {
                  filters.push(obj);
                }
              }
            }
          } else {
            for (const obj of element.childFilters) {
              if (obj.value !== undefined && obj.value !== null) {
                filters.push(obj);
              }
            }
          }
        }
      }
      
      const copyfilter = JSON.parse(JSON.stringify(filters));
      this.applyFilter.emit(copyfilter);
    }
  }


  clearFilter() {
    _.each(this.filters, (filter) => {
      if (filter.rangeFilter) {
        _.each(filter.childFilters, (childFilter) => {
          delete childFilter.value;
        });
      }
      delete filter.value;
    });
  }

  closeFilter() {
    this.menuCtrl.enable(true, 'filterMenuId');
    this.menuCtrl.close('filterMenuId');
  }

  filterValueChange(filter) {
    if (filter.onChangeEvent) {
      this.changeSelectFilter.emit(filter);
    }
  }

  /*getDisplayName(key) {
    const oldValue = key;
    key = "lbl_" + key.replace(/\s/g, "_");
    key = key.toLowerCase();
    const newValue = this.translate.transform(key);
    const setValue = newValue === key ? key : newValue;
    return setValue;
  }*/
  // tslint:disable-next-line:member-ordering
  dateFocus(filter) {
    if (!filter.value) {
      filter.value = JSON.parse(JSON.stringify(new Date(this.currentDate).toISOString()));
      filter.tempDateFlag = true;
    } else {
      filter.tempDateFlag = false;
    }
  }
  fromDateChanged(fromDateFilter, toDateFilter) {
    if (!fromDateFilter.tempDateFlag) {
      const fromDate = new Date(fromDateFilter.value);
      const toDate = new Date(toDateFilter.value);
      if (fromDate > toDate) {
        toDateFilter.value = fromDate.toISOString();
      }
    }
  }

  /*toDateChanged(fromDateFilter, toDateFilter) {
    if (!this.tempDateFlag) {
      const fromDate = new Date(fromDateFilter.value);
      const toDate = new Date(toDateFilter.value);
      if (fromDate < toDate) {
        fromDateFilter.value = toDate.toISOString();
      }
    }
  }*/
}
