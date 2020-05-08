import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LineChartComponent } from './components/line-chart/line-chart.component';
import { PieChartComponent } from './components/pie-chart/pie-chart.component';

@NgModule({
  declarations: [
    LineChartComponent,
    PieChartComponent,
  ],
  exports: [
    LineChartComponent,
    PieChartComponent
  ],
  imports: [
    CommonModule
  ]
})
export class ChartsModule { }
