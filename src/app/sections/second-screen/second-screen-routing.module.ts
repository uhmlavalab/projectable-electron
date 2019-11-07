import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { SecondScreenPageComponent } from './routes/second-screen-page/second-screen-page.component';

const secondScreenRoutes: Routes = [
  {
    path: '',
    component: SecondScreenPageComponent,
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(secondScreenRoutes)
  ],
  exports: [
    RouterModule
  ]
})
export class SecondScreenRoutingModule {}
