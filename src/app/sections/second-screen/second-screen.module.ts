import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SecondScreenPageComponent } from './routes/second-screen-page/second-screen-page.component';

import { SecondScreenRoutingModule } from './second-screen-routing.module';

@NgModule({
  declarations: [SecondScreenPageComponent],
  imports: [
    CommonModule,
    SecondScreenRoutingModule
  ]
})
export class SecondScreenModule { }
