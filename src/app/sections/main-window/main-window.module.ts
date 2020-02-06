import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Modules
import { MaterialModule } from '../../modules/material';
import { SharedModule } from '../../modules/shared';

// Routing
import { MainWindowRoutingModule } from './main-window-routing.module'

// Layout
import { MainWindowLayoutComponent } from './layout/main-window-layout.component';
import { PlanSelectionComponent } from './routes/plan-selection/plan-selection.component';

@NgModule({
  declarations: [
    MainWindowLayoutComponent,
    PlanSelectionComponent
  ],
  imports: [
    CommonModule,
    MaterialModule,
    MainWindowRoutingModule
  ]
})
export class MainWindowModule { }
