import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { MainWindowLayoutComponent } from './layout/main-window-layout.component';

const mapRoutes: Routes = [
  {
    path: '',
    component: MainWindowLayoutComponent,
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(mapRoutes)
  ],
  exports: [
    RouterModule
  ]
})
export class MainWindowRoutingModule {}
