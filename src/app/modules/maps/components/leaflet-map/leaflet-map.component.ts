import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import * as L from 'leaflet';
import { MapLayer } from '../../../../interfaces/mapLayer';
import * as d3 from 'd3';

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
  constructor() { }

  ngOnInit(): void {
    this.centerUpdate = Date.now();
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log(changes);
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
        console.log(layer);
        if (layer['layer'].name == 'solar' || layer['layer'].name == 'ial') return;
        d3.json(layer['layer'].filePath, (error, geoData) => {
          
          const d = new L.GeoJSON(geoData);
          d.setStyle({ fillColor: layer['layer'].fillColor })
          d.setStyle({ color: 'white' })
          d.setStyle({ fillOpacity: 0.8 })
          d.setStyle({ weight: 2 })
          d.addTo(this.map);
        })
      });
    }

  }

  onMapReady(map: L.Map) {
    this.map = map;
    this.map.panTo(L.latLng(this.center[0], this.center[1]));
    this.map.setZoom(this.zoom);

  }

}
