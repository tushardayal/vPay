import {Component, OnInit} from '@angular/core';
import {AccountSummaryService} from "../account-summary.service";
import {UserService} from "../../../../../services/aps-services/user.service";
import {Router} from "@angular/router";
import {ObjTransferService} from "../../../../../services/aps-services/obj-transfer.service";
import {RoutingStateService} from "../../../../../services/aps-services/routing-state.service";

@Component({
  selector: 'app-group-summary',
  templateUrl: './group-summary.component.html',
  styleUrls: ['./group-summary.component.scss'],
})
export class GroupSummaryComponent implements OnInit {

  groupSummary;

  constructor(private accountSummaryService: AccountSummaryService,
              private routingState: RoutingStateService,
              private objTransferService: ObjTransferService,
              private userService: UserService,
              private router: Router) {
  }

  ngOnInit() {
    this.accountSummaryService.getGroupSummary().subscribe(value => {
      this.groupSummary = [];

      const loanData = [];
      const fdData = [];
      const casaData = [];
      for (const summary of value.casaSummary) {
        const obj: any = {};
        obj[value.casaHeaders[0]] = summary.customerID;
        obj[value.casaHeaders[1]] = summary.customerName;
        obj[value.casaHeaders[2]] = summary.totDrBalance;
        obj[value.casaHeaders[3]] = summary.totCrBalance;
        obj[value.casaHeaders[4]] = summary.totAvailableBalance;
        casaData.push(obj);
      }

      for (const summary of value.loanSummary) {
        const obj: any = {};
        obj[value.loanHeaders[0]] = summary.customerID;
        obj[value.loanHeaders[1]] = summary.customerName;
        obj[value.loanHeaders[2]] = summary.totApprovedAmount;
        obj[value.loanHeaders[3]] = summary.totOutstandingAmount;
        obj[value.loanHeaders[4]] = summary.totOverdueAmount;
        obj[value.loanHeaders[5]] = summary.totDisbursedAmount;
        loanData.push(obj);
      }

      for (const summary of value.fdSummary) {
        const obj: any = {};
        obj[value.fdHeaders[0]] = summary.customerID;
        obj[value.fdHeaders[1]] = summary.customerName;
        obj[value.fdHeaders[2]] = summary.totalDepositAmt;
        obj[value.fdHeaders[3]] = summary.totalMaturityAmt;
        obj[value.fdHeaders[4]] = summary.totalLienAmt;
        fdData.push(obj);
      }

      const casaSummary = {displayName: 'Current and Savings Group Summary', accountType: 'casa', headers: value.casaHeaders, data: casaData};
      const loanSummary = {displayName: 'Loans Group Summary', accountType: 'loan', headers: value.loanHeaders, data: loanData};
      const fdSummary = {displayName: 'Fixed Deposits Group Summary', accountType: 'fd', headers: value.fdHeaders, data: fdData};

      this.groupSummary.push(casaSummary);
      this.groupSummary.push(loanSummary);
      this.groupSummary.push(fdSummary);

    });
  }

  refreshTab() {
    this.ngOnInit();
  }
  toggleGroup(group: any) {
    if (event) {
      event.stopPropagation();
    }
    group.show = !group.show;
  }

  goToAccountSummary(accountType, customerID) {
    const data = {
      cifNumber: customerID,
      accountType
    };
    this.objTransferService.setObjData('accountGroup', data);
    this.router.navigate(['menu/paypro/account-summary', {showSummary: true}]);
  }
}
