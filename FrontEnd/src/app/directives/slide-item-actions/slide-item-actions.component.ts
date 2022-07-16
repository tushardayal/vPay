import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { MoreActionsPopoverComponent } from './moreActionsPopover/more-actions-popover.component';
import { ListingService } from 'src/app/listing/listing.service';

@Component({
  selector: 'slide-item-actions',
  templateUrl: './slide-item-actions.component.html',
  styleUrls: ['./slide-item-actions.component.scss'],
})
export class SlideItemActionsComponent implements OnInit {
  @Input() item;
  disableSlide;
  @Output() onActionClicked = new EventEmitter<[Event, string, any]>();
  moreActions = [];
  actions = [];
  moreActionEvent;
  constructor(private popoverController: PopoverController, private listingSrv: ListingService) { }

  actionClicked(event, fun: string, item: any) {
    this.onActionClicked.emit([event, fun, item]);
  }
  ngOnInit() {
    if (this.item && this.item.actions && this.item.actions.length > 0) {
      const avalialbleActions = this.item.actions.filter((a) => !a.onClick.includes('view('));
      for (const action of avalialbleActions) {
        if (action.onClick.includes('selectAuthorizer(')
        || action.onClick.includes('selectVerifier(')
        || action.onClick.includes('confirm(')
        || action.onClick.includes('receipt(')
        || action.onClick.includes('openViewAuthRemarks(')) {
          this.moreActions.push(action);
        } else {
          this.actions.push(action);
        }
      }
    }
    this.listingSrv.multiSelectionMode$.subscribe(value => {
      this.disableSlide = value;
    });
  }
 async showMoreActions(ev) {
    this.moreActionEvent = ev;
    const popover = await this.popoverController.create({
      component: MoreActionsPopoverComponent,
      event: ev,
      translucent: true,
      componentProps: { moreActions: this.moreActions },
    });
    popover.onWillDismiss().then((data: any) => {
      if (data && data.data && this.moreActionEvent && data.data.fun && data.data.item) {
        this.onActionClicked.emit([this.moreActionEvent, data.data.fun, data.data.item]);
      }
    });
    return await popover.present();
  }
}
