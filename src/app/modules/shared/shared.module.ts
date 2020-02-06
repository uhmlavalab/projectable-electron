import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../material'


import { BouncingTitleComponent } from './components/bouncing-title/bouncing-title.component';
import { SpinningButtonComponent } from './components/spinning-button/spinning-button.component';


@NgModule({
  declarations: [
    BouncingTitleComponent,
    SpinningButtonComponent
  ],
  exports: [
    BouncingTitleComponent,
    SpinningButtonComponent
  ],
  imports: [
    CommonModule,
    MaterialModule
  ],
})
export class SharedModule { }
