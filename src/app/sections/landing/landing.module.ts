import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../modules/material';

import { SharedModule } from '../../modules/shared'

// Layout
import { LandingLayoutComponent } from './layout/landing-layout.component';

// Routes
import { LandingRoutingModule } from './landing-routing.module';

// Components

@NgModule({
  declarations: [
    LandingLayoutComponent,
  ],
  imports: [
    CommonModule,
    LandingRoutingModule,
    MaterialModule,
    SharedModule,
  ]
})
export class LandingModule { }
