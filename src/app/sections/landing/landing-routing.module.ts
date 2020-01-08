import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LandingLayoutComponent } from './layout/landing-layout.component';


// Routes
import { ScreenSelectionComponent } from './routes/screen-selection/screen-selection.component';
import { NewPlanComponent } from './routes/new-plan/new-plan.component';
import { EditPlanComponent } from './routes/edit-plan/edit-plan.component';
import { PlansListComponent } from './routes/plans-list/plans-list.component';

const landingRoutes: Routes = [
  {
    path: '',
    component: LandingLayoutComponent,
    children: [
      {
        path: 'screenselection',
        component: ScreenSelectionComponent
      },
      {
        path: 'planlist',
        component: PlansListComponent
      },
      {
        path: 'newplan',
        component: NewPlanComponent
      },
      {
        path: 'editplan',
        component: EditPlanComponent
      },
    ]
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(landingRoutes)
  ],
  exports: [
    RouterModule
  ]
})
export class LandingRoutingModule {}
