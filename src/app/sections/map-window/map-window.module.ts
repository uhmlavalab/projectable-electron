import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {DragDropModule} from '@angular/cdk/drag-drop';

// Modules
import { MaterialModule } from '@app/material';
import { SharedModule } from '@app/shared';
import { ChartsModule } from '@app/charts';
import { MapsModule } from '@app/maps';
import { MapWindowRoutingModule } from './map-window-routing.module'


// Routes
import { WaitingScreenComponent } from './routes/waiting-screen/waiting-screen.component';
import { HecoMainComponent } from './routes/heco-main/heco-main.component';

// Layout
import { MapWindowLayoutComponent } from './layout/map-window-layout.component';
import { YearDataDisplayComponent } from './components/year-data-display/year-data-display.component';
import { DisplayComponent } from './components/display/display.component';


@NgModule({
  declarations: [
    MapWindowLayoutComponent,
    WaitingScreenComponent,
    HecoMainComponent,
    YearDataDisplayComponent,
    DisplayComponent
  ],
  imports: [
    CommonModule,
    MapWindowRoutingModule,
    MaterialModule,
    SharedModule,
    ChartsModule,
    MapsModule,
    DragDropModule
  ]
})
export class MapWindowModule { }
