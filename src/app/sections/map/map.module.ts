import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapPageComponent } from './routes/map-page/map-page.component';

import { MapRoutingModule } from './map-routing.module';

@NgModule({
  declarations: [MapPageComponent],
  imports: [
    CommonModule,
    MapRoutingModule
  ]
})
export class MapModule { }
