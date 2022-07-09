import { ModuleWithProviders, NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { PipesModule, OrderBy } from '../pipes/pipes.module';
import { AlphaScroll } from './alpha-scroll';
import { CommonModule } from '@angular/common';

@NgModule({
  imports: [
    IonicModule,
    PipesModule,
    CommonModule
  ],
  exports: [
    AlphaScroll
  ],
  declarations: [
    AlphaScroll
  ]
})
export class ScrollModule {
}
