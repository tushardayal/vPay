import { Component, OnInit } from '@angular/core';
import {BehaviorSubject} from "rxjs";
import {shareReplay, tap} from "rxjs/operators";
import {TransactionQueryService} from "../transaction-query.service";

@Component({
  selector: 'app-paypro-transaction-query',
  templateUrl: './paypro-transaction-query.component.html',
  styleUrls: ['./paypro-transaction-query.component.scss'],
})
export class PayproTransactionQueryComponent implements OnInit {

  selectedProduct$;

  constructor(private txnQueryService: TransactionQueryService,) { }

  ngOnInit() {
    this.selectedProduct$ = this.txnQueryService.selectedProduct$.pipe(tap(console.log));

  }

}
