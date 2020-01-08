import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LandingModule } from './landing/landing.module';
import { MapWindowModule } from './map-window/map-window.module';
import { MainWindowModule } from './main-window/main-window.module';

@NgModule({
  imports: [
    CommonModule,
    LandingModule,
    MapWindowModule,
    MainWindowModule
  ]
})
export class SectionsModule { }
