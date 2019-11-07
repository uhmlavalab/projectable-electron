import { Component, OnInit } from '@angular/core';

import * as L from 'leaflet';

import { KeyboardInput } from '@app/inputTypes';
import * as fs from 'fs';
import { JsonPipe } from '@angular/common';

@Component({
  selector: 'app-new-plan',
  templateUrl: './new-plan.component.html',
  styleUrls: ['./new-plan.component.css']
})
export class NewPlanComponent implements OnInit {

  plan = {
    name: 'Maui',
    description: 'An Island in Hawaii.'
  };


  constructor() { }

  ngOnInit() {

  }

  savePlan() {
    const content = JSON.stringify(this.plan);
    const a = document.createElement("a");
    const file = new Blob([content], { type: 'text/json' });
    a.href = URL.createObjectURL(file);
    a.download = `${this.plan.name}-plan.json`;
    a.click();
  }


}
  // removeScenario(scenario: any) {
  //   this.scenarios = this.scenarios.filter( el => el !== scenario);
  // }

  // addScenario() {
  //   this.scenarios.push({
  //     name: `Scenario ${this.scenarios.length + 1}`,
  //     description: 'A New Scenario'
  //   });
  // }

   // options = {
  //   layers: [
  //     L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', { maxZoom: 18 })
  //   ],
  //   zoom: 5,
  //   center: L.latLng(46.879966, -121.726909)
  // };

  // scenarios = [
  //   {
  //     name: 'Post April',
  //     description: 'PSIP PostApril Scenario',
  //   },
  //   {
  //     name: 'E3',
  //     description: 'PSIP E3 Scenario',
  //   },
  //   {
  //     name: 'E3GenMod',
  //     description: 'PSIP E3GenMod Scenario',
  //   }
  // ];

  // input = [];