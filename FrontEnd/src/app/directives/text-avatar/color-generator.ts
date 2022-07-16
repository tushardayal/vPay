import { Injectable } from '@angular/core';

@Injectable()
export class ColorGenerator {

  constructor() {
    console.log('created');
  }

  COLORS = ['#0093d0', '#8884bc', '#b5b4aa', '#7565c0', '#504486', '#27aedf', '#ae9dc8', '#c1bab0', '#847caa', '#8acef2', '#72699e', '#57c0e6', '#006da3', '#deddd8', '#968eb6', '#2e52a0', '#c7c8ca', '#a0c7d3', '#c1bab0', '#3690bc', '#eae7f1', '#4c92ce', '#c4d6ee', '#00a8bd', '#8884bc', '#adb2b7'];

  public getColor(str: string): string {
    return this.COLORS[Math.abs(this.toNumber(str)) % this.COLORS.length];
  }

  private toNumber(str: string): number {
    let h = 0;

    for (let i = 0; i < str.length; i++) {
      h = 31 * h + str.charCodeAt(i);
      h |= 0; // Convert to 32bit integer
    }

    return h;
  }
}

