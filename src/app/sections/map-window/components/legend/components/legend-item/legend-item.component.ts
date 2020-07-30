import { Component, OnInit, Input, AfterViewInit } from '@angular/core';
import { PlanService } from '@app/services/plan.service';

@Component({
  selector: 'app-legend-item',
  templateUrl: './legend-item.component.html',
  styleUrls: ['./legend-item.component.css']
})
export class LegendItemComponent implements OnInit, AfterViewInit {

  @Input() layerName: string;
  @Input() displayName: string;
  @Input() state: number;
  private legendData: {text: string, color: string, textColor: string}[];

  constructor(private planService: PlanService) { 
    this.legendData = [];
  }

  ngOnInit() {
    this.legendData = this.planService.getLegendData(this.layerName);
  }

  ngAfterViewInit() {
    
  }

}
