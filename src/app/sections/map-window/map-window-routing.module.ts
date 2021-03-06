import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { MapWindowLayoutComponent } from './layout/map-window-layout.component';

// Routes
import { WaitingScreenComponent } from './routes/waiting-screen/waiting-screen.component';
import { HecoMainComponent } from './routes/heco-main/heco-main.component';

const mapRoutes: Routes = [
  {
    path: '',
    component: MapWindowLayoutComponent,
    children: [
      {
        path: 'map-screen',
        component: HecoMainComponent
      },
      {
        path: 'waiting-screen',
        component: WaitingScreenComponent
      }
    ]
  },
];

@NgModule({
  imports: [
    RouterModule.forChild(mapRoutes)
  ],
  exports: [
    RouterModule
  ]
})
export class MapWindowRoutingModule {}
