import { Component, OnInit, AfterViewInit } from '@angular/core';

import * as L from 'leaflet';

import { KeyboardInput } from '@app/inputTypes';
import * as fs from 'fs';
import { JsonPipe } from '@angular/common';
import { ipcRenderer } from 'electron';


@Component({
  selector: 'app-new-plan',
  templateUrl: './new-plan.component.html',
  styleUrls: ['./new-plan.component.css']
})
export class NewPlanComponent implements OnInit, AfterViewInit {

  plan = {
    name: 'Maui',
    description: 'An Island in Hawaii.'
  };

  map: L.Map;
  options = {
    layers: [
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { maxZoom: 18 })
    ],
    zoom: 5,
    center: L.latLng(46.879966, -121.726909)
  };

  scenarios = [
    {
      name: 'Post April',
      description: 'PSIP PostApril Scenario',
    },
    {
      name: 'E3',
      description: 'PSIP E3 Scenario',
    },
    {
      name: 'E3GenMod',
      description: 'PSIP E3GenMod Scenario',
    }
  ];

  constructor() {
    ipcRenderer.on('fileSaved', (event, msg) => {
      console.log(msg);
    });
    ipcRenderer.on('fileLoaded', (event, msg) => {
      console.log(JSON.parse(msg));
    });
  }

  ngOnInit() {

  }

  onMapReady(map: L.Map) {
    this.map = map;
    this.invalidMapSize();

  }

  ngAfterViewInit() {
    this.invalidMapSize();
  }

  invalidMapSize() {
    this.map.invalidateSize();
  }


  removeScenario(scenario: any) {
    this.scenarios = this.scenarios.filter(el => el !== scenario);
  }

  addScenario() {
    this.scenarios.push({
      name: `Scenario ${this.scenarios.length + 1}`,
      description: 'A New Scenario'
    });
  }

  saveFile() {
    ipcRenderer.send('saveFile', JSON.stringify({ name: this.plan.name, description: this.plan.description }));
  }

  loadFile() {
    ipcRenderer.send('loadFile', 'test.txt');
  }

}
