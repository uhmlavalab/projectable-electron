import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MapElementComponent } from './components/map-element/map-element.component';


@NgModule({
  declarations: [
    MapElementComponent
  ],
  exports: [
    MapElementComponent
  ],
  imports: [
    CommonModule
  ]
})
export class MapsModule { }
