import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../modules/material';

// Routes
import { MapWindowRoutingModule } from './map-window-routing.module'

// Layout
import { MapWindowLayoutComponent } from './layout/map-window-layout.component';


@NgModule({
  declarations: [
    MapWindowLayoutComponent
  ],
  imports: [
    CommonModule,
    MapWindowRoutingModule,
    MaterialModule
  ]
})
export class MapWindowModule { }
