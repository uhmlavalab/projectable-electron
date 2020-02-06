import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LandingLayoutComponent } from './layout/landing-layout.component';

import { ScreenSelectionComponent } from './routes/screen-selection/screen-selection.component';


const landingRoutes: Routes = [
  {
    path: '',
    component: LandingLayoutComponent,
    children: [
      {
        path: 'screen-selection',
        component: ScreenSelectionComponent
      }
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
export class LandingRoutingModule { }
