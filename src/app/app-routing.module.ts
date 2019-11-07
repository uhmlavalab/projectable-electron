import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const appRoutes: Routes = [

  {
    path: 'landing',
    loadChildren: () => import('./sections/landing/landing.module').then(mod => mod.LandingModule),
  },
  {
    path: 'map',
    loadChildren: () => import('./sections/map/map.module').then(mod => mod.MapModule),
  },
  {
    path: 'secondscreen',
    loadChildren: () => import('./sections/second-screen/second-screen.module').then(mod => mod.SecondScreenModule),
  },
  {
    path: '**',
    redirectTo: 'landing',
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(appRoutes, { useHash: true })
  ],
  exports: [
    RouterModule
  ]
})
export class AppRoutingModule { }
