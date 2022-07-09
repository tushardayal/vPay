import { HelpModalComponent } from './help-modal/help-modal.component';
import { Injectable, ElementRef } from '@angular/core';
import { ModalController, AnimationController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class HelpPageService {

  constructor(private modalController: ModalController, private animationCtrl: AnimationController) { }

  async presentHelpModal(inputData) {

    const enterAnimation = (baseEl: any) => {
      const wrapperAnimation = this.animationCtrl.create()
        .addElement(baseEl.querySelector('.modal-wrapper')!)
        .keyframes([
          { offset: 0, opacity: '0', transform: 'scale(1)' },
          { offset: 1, opacity: '0.99', transform: 'scale(1)' }
        ]);

      return this.animationCtrl.create()
        .addElement(baseEl)
        .easing('ease-in')
        .duration(500)
        .addAnimation([wrapperAnimation]);
    }

    const leaveAnimation = (baseEl: any) => {
      return enterAnimation(baseEl).direction('reverse');
    }

    console.log("res data", inputData);
    const modal = await this.modalController.create({
      component: HelpModalComponent,
      cssClass: 'helpPageModal',
      showBackdrop: false,
      componentProps: {
        inputData,
      },
      enterAnimation,
      leaveAnimation,
      backdropDismiss: false,
    });
    await modal.present();
    modal.onDidDismiss().then(() => {
      console.log("modal close");
    });
  }

  showHelpPage({labelArray = [], elArray = [], elParent }) {
    const helpArr = [];
    let selectedEl;
    if (labelArray.length > 0  && elArray.length > 0 && elParent) {
      let parent = elParent.el ? elParent.el : elParent.nativeElement;
      if (!parent) {
        console.log('parent not aavailable');
        return;
      }
      for (const obj of elArray) {
        let el ;
        if (obj.el) {
          el = obj.el;
        } else if (obj.nativeElement) {
          el = obj.nativeElement;
        }

        if (el.getBoundingClientRect().y < parent.getBoundingClientRect().y) {
         continue;
        } else {
          selectedEl = el;
          break;
        }
      }
    } else if (labelArray.length > 0 && elArray.length > 0 && !elParent) {
      selectedEl = elArray[0];
    }

    if (selectedEl) {
      for (const obj of labelArray) {
        helpArr.push({
          text: obj.text,
          el: selectedEl.querySelector('.' + obj.name) ? selectedEl.querySelector('.' + obj.name).getBoundingClientRect() : {}
        });
      }
    }
    this.presentHelpModal(helpArr);
  }
}
