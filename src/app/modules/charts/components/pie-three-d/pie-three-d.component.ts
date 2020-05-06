import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-pie-three-d',
  templateUrl: './pie-three-d.component.html',
  styleUrls: ['./pie-three-d.component.css']
})
export class PieThreeDComponent {

  chart = new Chart({
    chart: {
      type: 'line'
    },
    title: {
      text: 'Linechart'
    },
    credits: {
      enabled: false
    },
    series: [
      {
        name: 'Line 1',
        data: [1, 2, 3]
      }
    ]
  });

  // add point to chart serie
  add() {
    this.chart.addPoint(Math.floor(Math.random() * 10));
  }

}
