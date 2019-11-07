import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LandingModule } from './landing/landing.module';
import { MapModule } from './map/map.module';
import { SecondScreenModule } from './second-screen/second-screen.module';

@NgModule({
  declarations: [

  ],
  imports: [
    CommonModule,
    LandingModule,
    MapModule,
    SecondScreenModule
  ]
})
export class SectionsModule { }
