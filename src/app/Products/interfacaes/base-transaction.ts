export interface BaseTransaction {
  dataItemList: any[];
  parseViewData(): void;
  selectItem(item: any): void;
  view(item, $event: MouseEvent): void;
  loadMoreData(event): void;
  onActionClicked(event, fun: string, item: any): void;
  // authorize(id:string): void;
}

export interface ActionUrls {
  AUTHORIZE?: string;
  REJECT?: string;
  ACCEPT_REJECT?: string;
  VERIFY?: string;
  DECLINE?: string;
}
