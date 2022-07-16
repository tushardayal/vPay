import {
  Component,
  OnInit,
  Input,
  ElementRef,
  ViewChild,
  AfterViewInit,
  ViewChildren,
  QueryList,
} from "@angular/core";
import { ModalController, Platform, AnimationController } from "@ionic/angular";
import { Animation } from '@ionic/core';
@Component({
  selector: "app-help-modal",
  templateUrl: "./help-modal.component.html",
  styleUrls: ["./help-modal.component.scss"],
})
export class HelpModalComponent implements OnInit, AfterViewInit {
  @ViewChild("spanEl", { static : false}) spanEl: ElementRef;
  @ViewChild("helpcard", { static : false}) helpcardEl;
  @ViewChild("helpFooter", { static : false}) helpFooter;
  @Input() inputData = [];

  deviceHeight = 0;
  deviceWidth = 0;
  elementPosition: any = [];
  activeElementIndex = 0;
  animateEl: Animation;
  animateHelpCard: Animation;
  animateHelpFooter: Animation;
  currentElPosition = {x: 0, y: 0, left: 0, width: 0, top: 0, height: 0};
  currentCardPos = {x: 0, y: 0, isRight: false, isBottom: false};
  previousElPosition = {x: 0, y: 0, left: 0, width: 0, top: 0, height: 0};
  prevCardPos = {x: 0, y: 0, isRight: false, isBottom: false};
  animateDuration = 300;
  constructor(private modalCtrl: ModalController, private platform: Platform,
              private animationCtrl: AnimationController) {
    // console.log(this.inputData);
    this.deviceHeight = platform.height();
    this.deviceWidth = platform.width();
  }

  ngOnInit() {
    // console.log(this.inputData);
    for (let obj of this.inputData) {
      this.elementPosition.push(obj.el);
    }
  }

  ngAfterViewInit() {
    this.previousElPosition.height = this.deviceHeight;
    this.previousElPosition.width = this.deviceWidth;

    // console.log(this.spanEl);
    this.animateEl = this.animationCtrl.create('elementAnim');
    this.animateHelpCard = this.animationCtrl.create('helpCardElAnim');
    if (this.inputData && this.inputData.length > 0 ) {
      this.setElementPosition();
    }
    // this.animateHelpFooter = this.animationCtrl.create('helpFooterAnim');
    // this.animateHelpFooter.addElement(this.helpFooter.el)
    // .duration(300)
    // .easing('ease-in')
    // .iterations(1)
    // .fromTo('transform', 'translateY(100%)', 'translateY(0%)');
    // this.animateHelpFooter.play();
  }

  setElementPosition() {
    const el = this.spanEl;
    const pos = this.elementPosition[this.activeElementIndex];
    const prevCardElWidth = this.helpcardEl.el.getBoundingClientRect().width;
    const prevCardElHeight = this.helpcardEl.el.getBoundingClientRect().height;
    this.currentElPosition = {
      left: pos.left - 2,
      width: pos.width + 4,
      top: pos.top - 2,
      height: pos.height + 4,
      x: pos.left - 2,
      y: pos.top - 2
    };

    this.currentCardPos = {
      x: this.currentElPosition.left,
      y: (this.currentElPosition.top + this.currentElPosition.height),
      isRight: false,
      isBottom: false
    };
    let translateX = '0px';
    let translateY = '0px';
    const margin = 3;
    this.animateEl.stop();
    this.animateHelpCard.stop();

    if (this.currentElPosition.left > (this.deviceWidth / 2)) {
      this.currentCardPos.isRight = true;
    }

    if (this.currentElPosition.top > (this.deviceHeight / 2)) {
      this.currentCardPos.y = this.currentElPosition.top - margin;
      this.currentCardPos.isBottom = true;
    } else {
      this.currentCardPos.y += margin;
    }

    this.animateEl.addElement(el.nativeElement)
    .easing('ease-in')
    .iterations(1)
    .fromTo('height', this.previousElPosition.height + 'px', this.currentElPosition.height + 'px')
    .fromTo('left', this.previousElPosition.left + 'px',  this.currentElPosition.left + 'px')
    .fromTo('top', this.previousElPosition.top + 'px',  this.currentElPosition.top + 'px')
    .fromTo('width', this.previousElPosition.width + 'px',  this.currentElPosition.width + 'px')
    .duration(this.animateDuration);

    let left = this.prevCardPos.x;
    let top = this.prevCardPos.y;

    if (this.prevCardPos.isRight) {
      translateX = 'calc(-100% + ' + this.previousElPosition.width + 'px)';
    }
    if (!this.currentCardPos.isRight && this.prevCardPos.isRight) {
      left = this.prevCardPos.x -  prevCardElWidth + this.previousElPosition.width;
      translateX = '0px';
    }
    if (this.prevCardPos.isBottom ) {
      translateY = '-100%';
    }
    if (!this.currentCardPos.isBottom && this.prevCardPos.isBottom) {
      top = this.prevCardPos.y - prevCardElHeight ;
      translateY = '0px';
      // translateX = (this.prevCardPos.x - prevCardElWidth) + 'px' ;
    }

    this.animateHelpCard.addElement(this.helpcardEl.el)
    .easing('ease-in')
    .iterations(1)
    .fromTo('left', (left) + 'px',
                        this.currentCardPos.x + 'px')
    .fromTo('top', (top) + 'px',
                        this.currentCardPos.y + 'px')
    .fromTo('transform', 'translate(0px, 0px)', 'translate(0px, 0px)')
    .fromTo('marrgin-top', '0px', margin + 'px')
    .duration(this.animateDuration);

    // console.log('left top', left, top)

    if (this.currentCardPos.isBottom) {
      this.animateHelpCard.addElement(this.helpcardEl.el)
      .fromTo('marrgin-top', margin + 'px', '0px')
      .fromTo('transform',  'translateY(' + translateY + ')',  'translateY(-100%)');
    }
    if (this.currentCardPos.isRight) {
      this.animateHelpCard.addElement(this.helpcardEl.el)
      .fromTo('transform',  'translateX(' + translateX + ')',
                            'translateX(calc(-100% + ' + this.currentElPosition.width + 'px))');
    }
    if (this.currentCardPos.isRight && this.currentCardPos.isBottom) {
      this.animateHelpCard.addElement(this.helpcardEl.el)
      .fromTo('transform',  'translate(' + translateX + ', ' + translateY + ')',
                            'translate(calc(-100% + ' + this.currentElPosition.width + 'px), -100%)');
    }
    // console.log('translate', translateX, translateY)
    this.animateEl.play();
    this.animateHelpCard.play();
    this.previousElPosition = this.currentElPosition;
    this.prevCardPos = this.currentCardPos;
  }

  closeModal() {
    this.modalCtrl.dismiss();
  }

  nextElement(event: Event) {
    this.activeElementIndex = (this.activeElementIndex + 1) % this.inputData.length;
    this.setElementPosition();
    if (event) {
      event.stopPropagation();
    }
  }

  prevElement(event?) {
    this.activeElementIndex = (this.activeElementIndex - 1) ;
    this.setElementPosition();
    if (event) {
      event.stopPropagation();
    }
  }

  clickBackdrop(event) {
    // console.log(event.clientX, event.clientX);
    const x = event.clientX;
    const y = event.clientY;

    if (x > this.currentElPosition.x && x < (this.currentElPosition.x + this.spanEl.nativeElement.getBoundingClientRect().width)
        && y > this.currentElPosition.y && y < (this.currentElPosition.y + this.spanEl.nativeElement.getBoundingClientRect().height)) {
        // console.log('inside card');
        return;
    }
    let cardx1 = this.currentCardPos.x;
    let cardy1 = this.currentCardPos.y;
    let cardx2 = this.currentCardPos.x + this.helpcardEl.el.getBoundingClientRect().width;
    let cardy2 = this.currentCardPos.y + this.helpcardEl.el.getBoundingClientRect().height;

    if (this.currentCardPos.isRight) {
      cardx1 = this.currentCardPos.x - this.helpcardEl.el.getBoundingClientRect().width + this.currentElPosition.width;
      cardx2 = this.currentCardPos.x + this.currentElPosition.width;
    }

    if (this.currentCardPos.isBottom) {
      cardy1 = this.currentCardPos.y - this.helpcardEl.el.getBoundingClientRect().height;
      cardy2 = this.currentCardPos.y;
    }
    if (x > cardx1 && x < cardx2
        && y > cardy1 && y < cardy2) {
        // console.log('inside card');
        return;
    }
    this.closeModal();
    // console.log('close');
    // console.log(event);

  }
}
