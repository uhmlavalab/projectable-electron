import { Component, OnInit } from '@angular/core';
import { PlanService } from '@app/services/plan.service';

@Component({
  selector: 'app-display',
  templateUrl: './display.component.html',
  styleUrls: ['./display.component.css']
})
export class DisplayComponent implements OnInit {

  year: number;
  percentRenewable: number;
  scenario: string;

  constructor(private planService: PlanService) {
    this.year = 0;
    this.percentRenewable = 0;
    this.scenario = '';
  }

  ngOnInit() {
    this.planService.scenarioSubject.subscribe(scenario => {
      if (scenario) {
        this.scenario = scenario.displayName;
      } else {
        this.scenario = 'not set';
      }
    });
    this.displayData();
  }

  public displayData() {
    console.log(this.year, this.percentRenewable, this.scenario);
  }

}
