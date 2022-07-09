import {Input, SimpleChanges, Component, OnChanges} from '@angular/core';
import { ColorGenerator } from "./color-generator";

@Component({
  selector: 'text-avatar',
  template: `
    <div class="u-text-avatar" [ngStyle]="styles">{{ firstLetter }}</div>
  `,
  styleUrls: ['./text-avatar.scss']
})
export class TextAvatarComponent implements OnChanges {
  @Input() text: string;
  @Input() color: string;
  @Input() textColor: string;

  public firstLetter = "";
  public styles = {
    'background-color': "#fff",
    color: "#ffffff",
    'font-weight': "600"
  };

  constructor(private colorGenerator: ColorGenerator) {}

  ngOnChanges(changes: SimpleChanges) {
    const text = changes.text ? changes.text.currentValue : null;
    const color = changes.color ? changes.color.currentValue : null;
    const textColor = changes.textColor ? changes.textColor.currentValue : this.styles.color;

    this.firstLetter = this.extractFirstCharacter(text);

    this.styles = {...this.styles, 'background-color': this.backgroundColorHexString(color, text), color: textColor};
  }

  private extractFirstCharacter(text: string): string {
    return text.charAt(0) || '';
  }

  private backgroundColorHexString(color: string, text: string): string {
    return color || this.colorGenerator.getColor(text);
  }
}
