import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { MapPageComponent } from './routes/map-page/map-page.component';

const mapRoutes: Routes = [
  {
    path: '',
    component: MapPageComponent,
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
export class MapRoutingModule {}
