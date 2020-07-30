import { Component, AfterViewInit, ViewChildren, ElementRef, QueryList, OnInit } from '@angular/core';
import { PlanService } from '@app/services/plan.service';
import { MapLayer } from '@app/interfaces/mapLayer';

@Component({
  selector: 'app-legend',
  templateUrl: './legend.component.html',
  styleUrls: ['./legend.component.css']
})
export class LegendComponent implements AfterViewInit, OnInit {

  @ViewChildren('layerEl', { read: ElementRef }) layerElements: QueryList<ElementRef>;

  private layers: { layer: MapLayer, state: number }[];

  constructor(private planService: PlanService) {
    this.layers = [];
  }

  ngOnInit() {
    this.planService.layersSubject.subscribe(val => {
      if (val) {
        this.layers = val;
      }
    });
  }

  ngAfterViewInit() {
    this.planService.toggleLayerSubject.subscribe(val => {
      if (val && this.layers !== []) {
        this.layerElements.toArray().forEach(e => {
          if (e.nativeElement.id === val.layer.name) {
            e.nativeElement.style.opacity = val.state === 1 ? 1 : 0.1;
          }
        });
      }
    });
  }
}
