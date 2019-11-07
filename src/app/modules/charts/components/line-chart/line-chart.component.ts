import { Component, OnInit, ViewChild, ElementRef, Input } from '@angular/core';

import * as Chart from 'chart.js';

@Component({
  selector: 'app-line-chart',
  templateUrl: './line-chart.component.html',
  styleUrls: ['./line-chart.component.css']
})
export class LineChartComponent implements OnInit {

  @ViewChild('lineDiv', { static: true }) chartDiv: ElementRef;
  ctx: any;
  myChart: any;

  @Input() data: { x: [], y: [] }[];
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

    for (let i = 0; i < this.data.length; i++) {
      const d = {
        label: this.labels[i],
        fillColor: this.colors[i],
        strokeColor: this.colors[i],
        pointColor: this.colors[i],
        data: this.data[i].y,
      };
      dataset.datasets.push(d);
      dataset.labels.push(...this.data[i].x);
    }

   // dataset.labels =  [...new Set(dataset.labels)];
    this.createLineChart(dataset);
  }

  createLineChart(dataset: any) {
    this.ctx = this.chartDiv.nativeElement.getContext('2d');
    this.myChart = new Chart(this.ctx, {
      type: 'line',
      options: {
        responsive: false,
        annotation: {
          annotations: [
            {
              drawTime: 'afterDatasetsDraw',
              type: 'line',
              mode: 'vertical',
              scaleID: 'x-axis-0',
              value: dataset.labels[0],
              borderWidth: 3,
              borderColor: 'white',
              borderDash: [5, 5],
              label: {
                content: dataset.labels[0],
                enabled: true,
                position: 'top'
              }
            }
          ]
        },
        legend: {
          labels: {
            fontColor: 'white',
            fontStyle: 'bold',
            fontSize: 14
          }
        },
        scales: {
          xAxes: [{
            display: true,
            gridLines: {
              display: false,
              color: '#FFFFFF',
            },
            ticks: {
              fontSize: 14,
              fontStyle: 'bold',
              fontColor: 'white',
            },
            scaleLabel: {
              display: true,
              fontSize: 18,
              fontStyle: 'bold',
              fontColor: '#FFFFFF',
              labelString: 'Year'
            }
          }],
          yAxes: [{
            display: true,
            gridLines: {
              display: true,
              color: '#FFFFFF',
            },
            ticks: {
              fontSize: 14,
              fontStyle: 'bold',
              fontColor: 'white',
            },
            scaleLabel: {
              display: true,
              fontSize: 18,
              fontStyle: 'bold',
              fontColor: '#FFFFFF',
              labelString: 'Capacity (MW)'
            }
          }]
        }
      },
     // dataset
    });
  }

  updateAnnotationLine(value: any) {
    this.myChart.options.annotation.annotations[0].value = value;
    this.myChart.options.annotation.annotations[0].label.content = value;
    this.myChart.update();
  }

}

