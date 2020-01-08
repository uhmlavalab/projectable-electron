import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../modules/material';

// Layout
import { MainWindowLayoutComponent } from './layout/main-window-layout.component';

// Components

@NgModule({
  declarations: [
    MainWindowLayoutComponent
  ],
  imports: [
    CommonModule,
    MaterialModule
  ]
})
export class MainWindowModule { }
