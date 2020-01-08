import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const appRoutes: Routes = [

  {
    path: 'landing',
    loadChildren: () => import('./sections/landing/landing.module').then(mod => mod.LandingModule),
  },
  {
    path: 'map-window',
    loadChildren: () => import('./sections/map-window/map-window.module').then(mod => mod.MapWindowModule),
  },
  {
    path: 'main-window',
    loadChildren: () => import('./sections/main-window/main-window.module').then(mod => mod.MainWindowModule),
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
