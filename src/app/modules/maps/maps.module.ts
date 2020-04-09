import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';

import { MapElementComponent } from './components/map-element/map-element.component';
import { LeafletMapComponent } from './components/leaflet-map/leaflet-map.component';

@NgModule({
  declarations: [
    MapElementComponent,
    LeafletMapComponent
  ],
  exports: [
    MapElementComponent,
    LeafletMapComponent
  ],
  imports: [
    CommonModule,
    LeafletModule.forRoot()
  ]
})
export class MapsModule { }
