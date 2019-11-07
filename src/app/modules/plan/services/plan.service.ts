import { Injectable } from '@angular/core';
import { _ } from 'underscore';
import { Plan, MapLayer, CSVData, Scenario } from '../interfaces/plan';

import * as Papa from 'papaparse';

import { InputService } from '@app/input';
import { SoundsService } from '@app/sounds';

@Injectable({
  providedIn: 'root'
})
export class PlanService {

  private loadingPlan: boolean;

  private plan: Plan;
  private currentScenario: Scenario;

  constructor(private inputService: InputService, private soundService: SoundsService) { }

  /** Loads the selected plan
   * @param plan The plan to set up
   */
  public loadPlan(plan: Plan) {

    // this.loadingPlan = true;
    // this.plan = plan;
    // this.plan.scenarios.forEach(scenario => {
    //   scenario.csvData.forEach(csv => {
    //     this.loadCSVData(csv);
    //   });
    // });

    // this.currentScenario = this.plan.scenarios[0];

  }

  private setupInputListeners() {
    this.inputService.inputEventSubject.subscribe(event => {
      console.log(event);
    });

  }

  public loadCSVData(csvObject: CSVData): Promise<CSVData> {
    return new Promise((resolve, error) => {
      Papa.parse(`assets/plans/oahu/${csvObject.filePath}`, {
        complete: (results) => {
          console.log('Finished:', results);
        }
      });
    });
  }

  getPlan(): Plan {
    return this.plan;
  }

  // /** Advances to the next scenario */
  // public incrementScenario(): void {
  //   const index = this.plan.scenarios.indexOf(this.currentScenario) + 1;
  //   this.currentScenario = this.plan.scenarios[(index) % this.plan.scenarios.length];
  //   this.soundService.playClick();
  // }

  // /** Goes to the previous scenario */
  // public decrementScenario(): void {
  //   let index = this.plan.scenarios.indexOf(this.currentScenario) - 1;
  //   if (index === -1) {
  //     index = this.plan.scenarios.length - 1;
  //   }
  //   this.currentScenario = this.plan.scenarios[(index) % this.plan.scenarios.length];
  //   this.soundService.playClick();
  // }

  /** Gets the map bounds
   * @return array of bounds.
   */
  public getMapBounds(): any[] {
    return this.currentScenario.map.bounds;
  }


}
