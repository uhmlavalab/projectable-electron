import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { MainWindowLayoutComponent } from './layout/main-window-layout.component';

// Routes
import { PlanSelectionComponent } from './routes/plan-selection/plan-selection.component';

const mainRoutes: Routes = [
  {
    path: '',
    component: MainWindowLayoutComponent,
    children: [
      {
        path: 'plan-selection',
        component: PlanSelectionComponent
      }
    ]
  }
]; 

@NgModule({
  imports: [
    RouterModule.forChild(mainRoutes)
  ],
  exports: [
    RouterModule
  ]
})
export class MainWindowRoutingModule {}
