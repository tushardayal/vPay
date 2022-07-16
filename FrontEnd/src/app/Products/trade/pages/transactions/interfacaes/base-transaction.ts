export interface BaseTransaction {
  dataItemList: any[];
  parseViewData(): void;
  selectItem(item: any): void;
  view(item, $event: MouseEvent): void;
  loadMoreData(event): void;
  onActionClicked(event, fun: string, item: any): void;
  // authorize(id:string): void;
}
