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

/** This component displays the map and all layers */
export class MapElementComponent implements OnInit {

  @ViewChild('mapDiv', { static: true }) mapDiv: ElementRef;
  scale: number;
  width: number;                  // The current width of the map
  height: number;                 // The current height of the map
  rasterBounds: any[];
  baseMapImagePath: string;
  startingWidth: number;          // The height of the map when the app was started
  startingHeight: number;         // The width of the map when the app was started
  projection: d3.geo.Projection;
  path: d3.geo.Path;
  map: d3.Selection<any>;

  private drawn: boolean;         // True once the map is drawn to the display the first time
  private layers: any[];          // Holds all layers
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
    this.startingWidth = this.width;
    this.startingHeight = this.height;
    this.rasterBounds = mapData.bounds;
    this.baseMapImagePath = mapData.path;

    setTimeout(() => {
      this.planService.updateCSSWidth(null, 'map', this.width);
      this.planService.updateCSSHeight(null, 'map', this.height);
    }, 100);
  }

  ngOnInit() {

    // Subject receives any changes to the percent size of the map and resizes it.
    this.planService.resizeSubject.subscribe(data => {
      if (data) {
        if (data.id === 'resize map') {
          const percentage = data.percent / 100 * 2;
          if (this.width === 0) {
            this.planService.updateCSSWidth(null, 'map', this.width);
            this.planService.updateCSSHeight(null, 'map', this.height);
          }
          const newWidth = this.startingWidth * percentage;
          const newHeight = this.startingHeight * percentage;
          this.width = newWidth;
          this.height = newHeight;
          this.resizeMap();
        }
      }
    });

    // When the settings modal is opened on the GUI, all layers must be hidden because they will not
    // properly scale with the resizing of the map.
    this.planService.settingsModalOpenedSubject.subscribe(val => {
      if (val) {
        this.hideAllLayers();
      }
    });

    // If the resizing settings were not saved, the layers must be reset manually.
    this.planService.settingsCanceledSubject.subscribe(val => {
      if (val) {
        this.resetLayers();
      }
    });

    // If the map was resized and saved, redraw all of the parcels.
    this.planService.redrawPathsSubject.subscribe(val => {
      if (val) {
        this.redrawPaths();
      }
    });

    // Ture when the plan is set and the map setup can proceed
    this.planService.planSetSubject.subscribe(plan => {
      this.allReady.planSet = plan;
      this.updateMap();
    });

    // When the layers are set, the map setup can proceed.
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

    // Track changes in the current year.
    this.planService.yearSubject.subscribe(year => {
      if (year) {
        if (this.windowService.isMain()) {
          this.updateYear(year);
        } else {
          this.updateYear(year);
        }
      }
    });

    // IF the plan service requests the width, send the data.
    this.planService.getWidthSubject.subscribe((val: boolean) => {
      if (val) {
        this.planService.updateCSSWidth(null, 'map', this.width);
        this.planService.updateCSSHeight(null, 'map', this.height);
      }
    });
  }

  /** Sets all layer display to none. */
  private hideAllLayers() {
    this.layers.forEach(layer => {
      layer.layer.parcels.forEach(el => {
        d3.select(el.path).style('display', 'none');
      });
    });
  }

  /** Resets all layers to their visibility before they were hidden */
  private resetLayers() {
    this.layers.forEach(layer => {
      if (layer.layer.updateFunction !== null) {
        layer.layer.updateFunction(this.planService, layer.state);
      } else {
        this.defaultFill(layer.layer, layer.state);
      }
    });
  }

  /** Resizes the actual map image and svg.  Does not change any paths unless changes are saved. */
  private resizeMap(): void {
    this.map = d3.select(this.mapDiv.nativeElement).select('svg')
      .attr('width', this.width)
      .attr('height', this.height);
    this.map.select('image')
      .attr('width', this.width)
      .attr('height', this.height);
  }

  /** Draw the map once all data is ready. */
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
              layer.layer.setupFunction(this.planService, layer.state);
            } else {
              this.defaultFill(layer.layer, layer.state);
            }
          });
      });
    });
    this.drawn = true;
  }

  /** Clears all paths and recreates them with the new scale */
  private redrawPaths(): void {
    this.layers.forEach(layer => {
      if (layer.layer.filePath === null) {
        return;
      }
      layer.layer.parcels.forEach(el => {
        d3.select(el.path).style('display', 'none');
      });

      layer.layer.parcels = [];
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
              layer.layer.setupFunction(this.planService, layer.state);
            } else {
              this.defaultFill(layer.layer, layer.state);
            }
          });
      });
    });
  }

  /** Fills the parcels with the specified color. */
  defaultFill(layer, state) {
    layer.parcels.forEach(el => {
      d3.select(el.path)
        .style('fill', layer.fillColor)
        .style('opacity', state === 1 ? 0.85 : 0.0)
        .style('display', state === 1 ? 'block' : 'none')
        .style('stroke', layer.borderColor)
        .style('stroke-width', layer.borderWidth + 'px');
    });
  }

  /** True only when they year plan and layers are all received */
  private ready(): boolean {
    return this.allReady.yearSet && this.allReady.planSet && this.allReady.layersSet;
  }

  /** When the year changes, update the map
   * @param year the current year
   */
  private updateYear(year: number): void {
    this.year = year;
    if (!this.allReady.yearSet) {
      this.allReady.yearSet = true;
    }
    this.updateMap();
  }

  /** Updates the layers whenever a new year is received. */
  private updateMap(): void {
    if (this.ready() && this.drawn) {
      this.layers.forEach(layer => {
        if (layer.layer.updateFunction !== null && layer.state === 1) {
          layer.layer.updateFunction(this.planService, layer.state);
        }
      });
    } else if (this.ready() && !this.drawn) {
      this.drawMap();
    }
  }
}
