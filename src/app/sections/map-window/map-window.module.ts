import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Modules
import { MaterialModule } from '@app/material';
import { SharedModule } from '@app/shared';
import { ChartsModule } from '@app/charts';
import { MapsModule } from '@app/maps';

// Routes
import { MapWindowRoutingModule } from './map-window-routing.module'

// Layout
import { MapWindowLayoutComponent } from './layout/map-window-layout.component';
import { WaitingScreenComponent } from './routes/waiting-screen/waiting-screen.component';


@NgModule({
  declarations: [
    MapWindowLayoutComponent,
    WaitingScreenComponent
  ],
  imports: [
    CommonModule,
    MapWindowRoutingModule,
    MaterialModule,
    SharedModule,
    ChartsModule,
    MapsModule,
  ]
})
export class MapWindowModule { }
