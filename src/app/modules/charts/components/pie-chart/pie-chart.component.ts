import { Component, OnInit, ViewChild, ElementRef, OnDestroy, Input } from '@angular/core';
import * as Chart from 'chart.js';

@Component({
  selector: 'app-pie-chart',
  templateUrl: './pie-chart.component.html',
  styleUrls: ['./pie-chart.component.css']
})
export class PieChartComponent implements OnInit {

  @ViewChild('pieDiv', { static: true }) chartDiv: ElementRef;
  ctx: any;
  myChart: any;

  @Input() data: number[];
  @Input() labels: string[];
  @Input() colors: string[];

  @Input() title: string;
  @Input() borderWidth: number;

  constructor() { }

  ngOnInit() {
    const dataset = {
      labels: [],
      datasets: [],
    };
    dataset.labels = this.labels;
    dataset.datasets.push({
      data: this.data,
      borderWidth: this.borderWidth,
      borderColor: this.colors,
      backgroundColor: this.colors,

    });
    this.createPieChart(dataset);
  }

  createPieChart(dataset: any) {
    this.ctx = this.chartDiv.nativeElement.getContext('2d');
    this.myChart = new Chart(this.ctx, {
      type: 'pie',
      options: {
        title: {
          display: true,
          text: this.title,
          position: 'top',
          fontColor: 'white',
          fontSize: 18
        },
        legend: {
          display: false,
          labels: {
            fontColor: 'white',
            fontStyle: 'bold',
            fontSize: 14,
          }
        },
        responsive: false,
        plugins: {
          labels: [{
            render: 'label',
            position: 'border',
            fontSize: 10,
            overlap: false,
            fontStyle: 'bold',
            fontColor: 'white'
          },
          {
            render: 'percentage',
            fontColor: 'white',
            fontSize: 8,
            fontStyle: 'bold',
            overlap: false,
          }]
        },
      },
      dataset
    });
  }

  updatePieChart() {
    // TO DO
  }

}

