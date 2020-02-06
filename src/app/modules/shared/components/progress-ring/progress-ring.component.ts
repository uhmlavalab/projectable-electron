import { Component, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-progress-ring',
  templateUrl: './progress-ring.component.html',
  styleUrls: ['./progress-ring.component.css']
})
export class ProgressRingComponent implements AfterViewInit {
  private radius: number;
  private height: number;
  private fill: string;
  private strokeWidth: number;
  private normalizedRadius: number;
  private dashArray: any;
  private stroke: string;

  constructor() { 
    
  }

  ngAfterViewInit() {
    this.radius = 100;
    this.height = this.radius * 2;
    this.fill = 'blue';
    this.stroke = 'red';
    this.strokeWidth = 4;
    this.normalizedRadius = this.radius - this.strokeWidth / 2;
  }

}
// <svg
// height={{height}}
// width={{height}}
// >
// <circle
//   stroke={{stroke}}
//   fill={{fill}}
//   strokeWidth={{strokeWidth}}
//   strokeDasharray={{dashArray}}
//   r={{this.normalizedRadius}}
//   cx={{radius}}
//   cy={{radius}}
//   />
// </svg>