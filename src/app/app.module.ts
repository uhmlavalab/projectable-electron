import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// Drag Drop
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MultiWindowModule } from 'ngx-multi-window';

import { LeafletModule } from '@asymmetrik/ngx-leaflet';

// Modules
import { ChartsModule } from '@app/charts';
import { SoundsModule } from '@app/sounds';
import { PlanModule } from '@app/plan';
import { SectionsModule } from '@app/sections';
import { MapsModule } from '@app/maps';
import { UserInputModule } from '@app/input';

// Components
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';


@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    DragDropModule,
    MultiWindowModule,
    ChartsModule,
    PlanModule,
    SectionsModule,
    MapsModule,
    SoundsModule,
    UserInputModule,
    LeafletModule.forRoot()
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
