import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Modules
import { MaterialModule } from '@app/material';
import { SharedModule } from '@app/shared'

// Layout
import { LandingLayoutComponent } from './layout/landing-layout.component';

// Routes
import { LandingRoutingModule } from './landing-routing.module';
import { ScreenSelectionComponent } from './routes/screen-selection/screen-selection.component';

@NgModule({
  declarations: [
    LandingLayoutComponent,
    ScreenSelectionComponent,
  ],
  imports: [
    CommonModule,
    LandingRoutingModule,
    MaterialModule,
    SharedModule,
  ]
})
export class LandingModule { }
