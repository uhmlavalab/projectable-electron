import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GoogleChartsModule } from 'angular-google-charts';

import { LineChartComponent } from './components/line-chart/line-chart.component';
import { PieChartComponent } from './components/pie-chart/pie-chart.component';
import { PieThreeDComponent } from './components/pie-three-d/pie-three-d.component';
import { GagueChartComponent } from './gague-chart/gague-chart.component';
import { BarComponent } from './components/bar/bar.component';


@NgModule({
  declarations: [
    LineChartComponent,
    PieChartComponent,
    PieThreeDComponent,
    GagueChartComponent,
    BarComponent
  ],
  exports: [
    LineChartComponent,
    PieChartComponent,
    PieThreeDComponent,
    GagueChartComponent,
    BarComponent
  ],
  imports: [
    CommonModule,
    GoogleChartsModule
  ]
})
export class ChartsModule { }
