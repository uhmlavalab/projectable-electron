import { Component, OnInit } from '@angular/core';

import { ipcRenderer } from 'electron';


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
