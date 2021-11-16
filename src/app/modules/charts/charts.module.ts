import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GoogleChartsModule } from 'angular-google-charts';

import { LineChartComponent } from './components/line-chart/line-chart.component';
import { PieChartComponent } from './components/pie-chart/pie-chart.component';
import { BarComponent } from './components/bar/bar.component';


@NgModule({
  declarations: [
    LineChartComponent,
    PieChartComponent,
    BarComponent
  ],
  exports: [
    LineChartComponent,
    PieChartComponent,
    BarComponent
  ],
  imports: [
    CommonModule,
    GoogleChartsModule
  ]
})
export class ChartsModule { }
