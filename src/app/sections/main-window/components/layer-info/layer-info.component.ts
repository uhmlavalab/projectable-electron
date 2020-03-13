import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { PlanService } from '@app/services/plan.service';
import { ActiveDescendantKeyManager } from '@angular/cdk/a11y';

@Component({
  selector: 'app-layer-info',
  templateUrl: './layer-info.component.html',
  styleUrls: ['./layer-info.component.css']
})
export class LayerInfoComponent implements OnInit {

  @ViewChild('detailsButton', { static: false }) deets: ElementRef;
  @ViewChild('legendButton', { static: false }) legend: ElementRef;

  private layer: any;
  private layerSet: boolean;
  private showDetails: boolean; // If true, details are shown, if false legend is shown.

  constructor(private planService: PlanService) {
    this.layerSet = false;
    this.layer = null;
    this.showDetails = true;
  }

  ngOnInit() {
    this.planService.layerInfoSubject.subscribe(e => {
      if (e) {
        this.layerSet = true;
        this.layer = e.layer;
      }
    });
  }

  private handleClick(details: boolean) {

    this.showDetails = details;

    const activeColor = 'rgb(156, 210, 207)';
    const activeTextColor = 'rgb(209, 235, 236)';
    const black = 'black';
    let activeE = null;
    let other = null;

    if (details) {
      activeE = this.deets.nativeElement;
      other = this.legend.nativeElement;
    } else {
      activeE = this.legend.nativeElement;
      other = this.deets.nativeElement;
    }

    activeE.style.backgroundColor = activeColor;
    activeE.style.color = black;
    activeE.style.textDecoration = 'underline';
    other.style.backgroundColor = black;
    other.style.color = activeColor;
    other.style.textDecoration = 'none';
  }


}
