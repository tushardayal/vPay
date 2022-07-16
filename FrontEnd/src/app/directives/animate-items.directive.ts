import {
  Directive,
  ContentChildren,
  QueryList,
  ElementRef,
  AfterViewInit,
  Input,
  Renderer2,
} from "@angular/core";
import { IonItem, IonCol, IonRow, IonItemSliding } from "@ionic/angular";

@Directive({
  selector: "[appAnimateItems]",
})
export class AnimateItemsDirective implements AfterViewInit {
  @Input() className: string;

  private observer: IntersectionObserver;
  private elementObserver: MutationObserver;
  @ContentChildren(IonCol, { read: ElementRef }) itemsColumn: QueryList<
    ElementRef
  >;
  @ContentChildren(IonItem, { read: ElementRef }) items: QueryList<ElementRef>;
  @ContentChildren(IonRow, { read: ElementRef }) row: QueryList<ElementRef>;
  @ContentChildren(IonItemSliding, { read: ElementRef }) itemSliding: QueryList<ElementRef>;
  constructor(private renderer: Renderer2, private elRef: ElementRef) {}

  changes(data) {
    console.log(data);
  }
  ngAfterViewInit() {
    let options = {
      threshold: 0.5,
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach((entry: any) => {
        if (entry.isIntersecting) {
          this.renderer.addClass(entry.target, this.className);
        }
        // else {
        //   this.renderer.removeClass(entry.target, this.className);
        // }
      });
    }, options);

    this.items.forEach((item, index, arr) => {
      setTimeout(() => {
        this.observer.observe(item.nativeElement);
      }, index * 100);
    });

    this.row.forEach((item, index, arr) => {
      setTimeout(() => {
        this.observer.observe(item.nativeElement);
      }, index * 100);
    });

    this.itemSliding.forEach((item, index, arr) => {
      setTimeout(() => {
        this.observer.observe(item.nativeElement);
      }, index * 100);
    });

    this.itemsColumn.forEach((item, index, arr) => {
      setTimeout(() => {
        this.observer.observe(item.nativeElement);
      }, index * 100);
    });
  }
}
