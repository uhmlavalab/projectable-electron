import { Component, OnInit } from '@angular/core';
import { PlanService } from '@app/services/plan.service';

@Component({
  selector: 'app-year-data-display',
  templateUrl: './year-data-display.component.html',
  styleUrls: ['./year-data-display.component.css']
})
export class YearDataDisplayComponent implements OnInit {

  year: number;
  percentRenewable: number;
  scenario: string;

  constructor(private planService: PlanService) {
    this.year = 0;
    this.percentRenewable = 0;
    this.scenario = 'not set';
   }

  ngOnInit() {
    this.planService.yearSubject.subscribe(year => {
      if (year) {  
        this.year = year;
      } else {
        this.year = 9999;
      }
    });

    this.planService.precentRenewableByYearSubject.subscribe(percent => {
      if (percent) {
        this.percentRenewable = percent;
      } else {
        this.percentRenewable = 0;
      }
    });

    this.planService.scenarioSubject.subscribe(scenario => {
      if (scenario) {
        this.scenario = scenario.displayName;
      } else {
        this.scenario = 'not set';
      }
    });
  }
}