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

  private drawn: false;
  private layers: any[];
  private year: number;
  private allReady: {
    layersSet: boolean,
    planSet: boolean,
    scenariosSet: boolean,
    yearSet: boolean
  }

  constructor(private planService: PlanService, private windowService: WindowService) {
    this.drawn = false;
    const mapData = planService.getMapData();
    this.scale = this.windowService.isMain() ? mapData.miniScale : mapData.scale;
    this.width = mapData.width * this.scale;
    this.height = mapData.height * this.scale;
    this.rasterBounds = mapData.bounds;
    this.baseMapImagePath = mapData.path;
  }

  ngOnInit() {


    this.planService.layersSubject.subscribe(layers => {
      this.layers = layers;
      this.allReady.layersSet = true;
    });

    // Subscribe to layer toggling
    this.planService.toggleLayerSubject.subscribe(layer => {
      if (layer) {
        if (layer.updateFunction !== null) {
          layer.updateFunction(this.planService);
        } else {
          this.defaultFill(layer);
        }
      }
    });

    this.planService.yearSubject.subscribe(year => {
      if (year) {
        this.updateYear(year);
        if (this.ready()) {
          this.updateMap();
        }
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
      if (layer.filePath === null) {
        return;
      }
      d3.json(`${layer.filePath}`, (error, geoData) => {
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
            layer.parcels.push({ path: this, properties: (d.hasOwnProperty(`properties`)) ? d[`properties`] : null } as Parcel);
          }).call(() => {
            if (layer.setupFunction !== null) {
              layer.setupFunction(this.planService);
            } else {
              this.defaultFill(layer);
            }
          });
      });
    });
  }

  defaultFill(layer: MapLayer) {
    layer.parcels.forEach(el => {
      d3.select(el.path)
        .style('fill', layer.fillColor)
        .style('opacity', layer.active ? 0.85 : 0.0)
        .style('stroke', layer.borderColor)
        .style('stroke-width', layer.borderWidth + 'px');
    });
  }

  private ready(): boolean {
    return this.allReady.yearSet && this.allReady.scenariosSet && this.allReady.planSet && this.allReady.layersSet;
  }

  private updateYear(year: number): void {
    this.year = year;
    if (!this.allReady.yearSet) {
      this.allReady.yearSet = true;
    } else {
      this.updateMap();
    }
  }

  private updateMap(): void {
    if (this.ready && this.drawn) {
      this.layers.forEach(layer => {
        if (layer.updateFunction !== null && layer.active) {
          layer.updateFunction(this.planService);
        }
      });
    } else if (this.ready && !this.drawn) {
      this.drawMap();
    }
  }
}
