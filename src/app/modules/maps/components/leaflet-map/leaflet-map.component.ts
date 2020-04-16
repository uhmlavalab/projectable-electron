import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import * as L from 'leaflet';
import { MapLayer, Parcel } from '../../../../interfaces/mapLayer';
import * as d3 from 'd3';
import { PlanService } from '@app/services/plan.service';

@Component({
  selector: 'app-leaflet-map',
  templateUrl: './leaflet-map.component.html',
  styleUrls: ['./leaflet-map.component.css']
})
export class LeafletMapComponent implements OnInit {

  @Input() center: [number, number];
  @Input() zoom: number;
  @Input() layers: MapLayer[];
  map: L.Map;

  leafletLayers: { layer: L.GeoJSON, name: string, active: boolean }[] = [];

  centerUpdate: number;
  options = {
    layers: [
      L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png', {
        maxZoom: 20,
      })
    ],
    zoom: 12,
    center: L.latLng(46.879966, -121.726909),
    zoomControl: false
  };
  constructor(private planService: PlanService) { }

  ngOnInit(): void {
    this.centerUpdate = Date.now();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.center && this.map) {
      if ((Date.now() - this.centerUpdate) > 0.25) {
        this.center = changes.center.currentValue;
        this.map.panTo(L.latLng(this.center[0], this.center[1]), { animate: false });
        this.centerUpdate = Date.now();
      }
    }

    if (changes.zoom && this.map) {
      this.zoom = changes.zoom.currentValue;
      this.map.setZoom(this.zoom);
    }
    if (changes.layers) {
      this.layers = changes.layers.currentValue;
      this.layers.forEach(layer => {
        d3.json(layer['layer'].filePath, (error, geoData) => {
          const d = new L.GeoJSON(geoData);
          d.eachLayer((el) => {
            layer['layer'].parcels.push({ path: el, properties: (el['feature'].hasOwnProperty(`properties`)) ? el['feature'][`properties`] : null } as Parcel)
          });
          console.log(layer);
          if (layer['layer'].setupFunction) {
            layer['layer'].setupFunction(this.planService, false);
          } else {
            layer['layer'].parcels.forEach(parcel => {
              parcel.path.options.color = layer['layer'].fillColor;
              parcel.path.options.weight = layer['layer'].borderWidth;
            })
          }
        })
      });
    }

    // Subscribe to layer toggling
    this.planService.toggleLayerSubject.subscribe(layer => {
      if (!layer) return;
      (layer.state) ? layer['layer'].parcels.forEach(el => { this.map.addLayer(el.path); }) : layer['layer'].parcels.forEach(el => { this.map.removeLayer(el.path); });
    });
    
    this.planService.yearSubject.subscribe(year => {
      this.layers.forEach(layer => {
        if (layer['state']) {
          if (layer['layer'].updateFunction) {
            layer['layer'].parcels.forEach(el => { this.map.removeLayer(el.path); })
            layer['layer'].updateFunction(this.planService, layer['layer'].active, false);
            layer['layer'].parcels.forEach(el => { this.map.addLayer(el.path); })
          }
        }
      })
    });

  }

  onMapReady(map: L.Map) {
    this.map = map;
    this.map.panTo(L.latLng(this.center[0], this.center[1]));
    this.map.setZoom(this.zoom);

  }

}
