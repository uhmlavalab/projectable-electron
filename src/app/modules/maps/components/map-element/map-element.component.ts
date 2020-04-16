import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { PlanService } from '@app/services/plan.service';
import * as d3 from 'd3';
import { MapLayer, Parcel } from '@app/interfaces';
import { WindowService } from '@app/modules/window';

@Component({
  selector: 'app-map-element',
  templateUrl: './map-element.component.html',
  styleUrls: ['./map-element.component.css']
})

export class MapElementComponent implements OnInit {

  @ViewChild('mapDiv', { static: true }) mapDiv: ElementRef;
  scale: number;
  width: number;
  height: number;
  rasterBounds: any[];
  baseMapImagePath: string;

  projection: d3.geo.Projection;
  path: d3.geo.Path;
  map: d3.Selection<any>;

  private drawn: boolean;
  private layers: any[];
  private year: number;
  private allReady: any;

  constructor(private planService: PlanService, private windowService: WindowService) {
    this.allReady = {};
    this.allReady.planSet = false;
    this.allReady.layersSet = false;
    this.allReady.yearSet = false;
    this.drawn = false;
    const mapData = planService.getMapData();
    this.scale = this.windowService.isMain() ? mapData.miniScale : mapData.scale;
    this.width = mapData.width * this.scale;
    this.height = mapData.height * this.scale;
    this.rasterBounds = mapData.bounds;
    this.baseMapImagePath = mapData.path;
    setTimeout( () => {
      this.planService.updateCSSWidth(null, 'map', this.width);
      this.planService.updateCSSHeight(null, 'map', this.height);
    });
  }

  ngOnInit() {
    this.planService.resizeSubject.subscribe(data => {
      if (data) {
        let e = null;
        const percentage = data.percent / 100 * 2;
        if (data.id === 'resize map') {
          e = this.mapDiv.nativeElement.children[0];
          const image = e.children[0];
          if (this.width === 0) {
            this.planService.updateCSSWidth(null, 'map', this.width);
            this.planService.updateCSSHeight(null, 'map', this.height);
          }
          const newWidth = this.width * percentage;
          const newHeight = this.height * percentage;
          e.style.width = `${newWidth}px`;
          image.style.width = `${newWidth}px`;
          e.style.height = `${newHeight}px`;
          image.style.height = `${newHeight}px`;
        }
      }
    });

    this.planService.planSetSubject.subscribe(plan => {
      this.allReady.planSet = plan;
      this.updateMap();
    });
    this.planService.layersSubject.subscribe(layers => {
      this.layers = layers;
      this.allReady.layersSet = true;
      this.updateMap();
    });

    // Subscribe to layer toggling
    this.planService.toggleLayerSubject.subscribe(layer => {
      if (layer) {
        this.layers.forEach(el => {
          if (layer.layer.name === el.layer.name) {
            el.state = layer.state;
          }
          if (el.layer.updateFunction !== null) {
            el.layer.updateFunction(this.planService, el.state);
          } else {
            this.defaultFill(el.layer, el.state);
          }
        });
      }
    });

    this.planService.yearSubject.subscribe(year => {
      if (year) {
        if (this.windowService.isMain()) {
          this.updateYear(year);
        } else {
          this.updateYear(year);
        }
      }
    });

    this.planService.getWidthSubject.subscribe((val: boolean) => {
      if (val) {
        this.planService.updateCSSWidth(null, 'map', this.width);
        this.planService.updateCSSHeight(null, 'map', this.height);
      }
    });
  }

  private drawMap(): void {
    this.projection = d3.geo.mercator()
      .scale(1)
      .translate([0, 0]);

    this.path = d3.geo.path()
      .projection(this.projection);

    this.map = d3.select(this.mapDiv.nativeElement).append('svg')
      .attr('width', this.width)
      .attr('height', this.height);

    this.map.append('image')
      .attr('xlink:href', `${this.baseMapImagePath}`)
      .attr('width', this.width)
      .attr('height', this.height);

    this.layers.forEach(layer => {
      if (layer.layer.filePath === null) {
        return;
      }
      d3.json(`${layer.layer.filePath}`, (error, geoData) => {
        const bounds = [this.projection(this.rasterBounds[0]), this.projection(this.rasterBounds[1])];
        const scale = 1 / Math.max((bounds[1][0] - bounds[0][0]) / this.width, (bounds[1][1] - bounds[0][1]) / this.height);
        const transform = [
          (this.width - scale * (bounds[1][0] + bounds[0][0])) / 2,
          (this.height - scale * (bounds[1][1] + bounds[0][1])) / 2
        ] as [number, number];

        const proj = d3.geo.mercator()
          .scale(scale)
          .translate(transform);

        const path = d3.geo.path()
          .projection(proj);

        this.map.selectAll(layer.name)
          .data(geoData.features)
          .enter().append('path')
          .attr('d', path)
          .attr('class', layer.name)
          .each(function (d) {
            layer.layer.parcels.push({ path: this, properties: (d.hasOwnProperty(`properties`)) ? d[`properties`] : null } as Parcel);
          }).call(() => {
            if (layer.layer.setupFunction !== null) {
              layer.layer.setupFunction(this.planService, layer.state, true);
            } else {
              this.defaultFill(layer.layer, layer.state);
            }
          });
      });
    });
    this.drawn = true;
  }

  defaultFill(layer, state) {
    layer.parcels.forEach(el => {
      d3.select(el.path)
        .style('fill', layer.fillColor)
        .style('opacity', state === 1 ? 0.85 : 0.0)
        .style('stroke', layer.borderColor)
        .style('stroke-width', layer.borderWidth + 'px');
    });
  }

  private ready(): boolean {
    return this.allReady.yearSet && this.allReady.planSet && this.allReady.layersSet;
  }

  private updateYear(year: number): void {
    this.year = year;
    if (!this.allReady.yearSet) {
      this.allReady.yearSet = true;
    } 
    this.updateMap();
  }

  private updateMap(): void {
    if (this.ready() && this.drawn) {
      this.layers.forEach(layer => {
        if (layer.layer.updateFunction !== null && layer.state === 1) {
          layer.layer.updateFunction(this.planService, layer.state, true);
        }
      });
    } else if (this.ready() && !this.drawn) {
      this.drawMap();
    }
  }
}
