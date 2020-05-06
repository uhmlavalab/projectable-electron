import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LineChartComponent } from './components/line-chart/line-chart.component';
import { PieChartComponent } from './components/pie-chart/pie-chart.component';
import { PieThreeDComponent } from './components/pie-three-d/pie-three-d.component';

@NgModule({
  declarations: [
    LineChartComponent, 
    PieChartComponent, PieThreeDComponent
  ],
  exports: [
    LineChartComponent, 
    PieChartComponent,
    PieThreeDComponent
  ],
  imports: [
    CommonModule
  ]
})
export class ChartsModule { }
