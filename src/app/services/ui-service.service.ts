import { Injectable } from '@angular/core';
import { Plans } from '../../assets/plans/plans';
import { Plan } from '@app/interfaces/plan';
import { Subject } from 'rxjs';
import { PlanService } from './plan.service';
import { WindowService } from '@app/modules/window';

@Injectable({
  providedIn: 'root'
})
export class UiServiceService {

  private plans: Plan[];
  private currentPlan: Plan;
  public scenarioListSubject = new Subject<any[]>();

  constructor(private planService: PlanService, private windowService: WindowService) { 
    this.planService.setMain(false); // Let this plan service know that it is not the main map service.
    this.plans = Plans; // All Plans
  }

  /** Sets the current plan.  This is called when reading a message.  All Plans
   * are already in this service but they need to be set.
   */
  public setCurrentPlan(planName: string): Plan {
    this.plans.forEach(plan => {
      if (plan.name === planName) {
        this.currentPlan = plan;
      }
    });
    return this.currentPlan;
  }

  public setYear(year: number): void {
    this.planService.setCurrentYear(year);
    this.windowService.sendMessage({year});
  }

  /** Increments the year on the map. */
  public incrementYear() {
    const year = this.planService.incrementCurrentYear();
    this.windowService.sendMessage({year});
  }

  /** Decrements current Year and notifies the map of the change */
  public decrementYear() {
    const year = this.planService.decrementCurrentYear();
    this.windowService.sendMessage({year});
  }

  /** Changes year based on the data passed by the slider.  This is the percent
   * distance from the left side of the slider.
   * @param percent the percent distance from the left side of the slider component.
   */
  public changeYear(percent: number) {
    const max = this.currentPlan.maxYear;
    const min = this.currentPlan.minYear;
    const totalYears = max - min + 1;
    const currentNumber = Math.trunc(Math.round(totalYears * percent + min));
    const year = this.planService.setCurrentYear(currentNumber);
    this.windowService.sendMessage({year});
  }

  /** The scrollable menu passes data and type to this function and the UI and Map
   * are notified of the change.
   * @param type the type of change
   * @param data the value of the change.
   */
  public handleMenuChange(type: string, data: any): void {
    if (type === 'year') {
      this.setYear(data);
    } else if (type === 'scenario') {
      const val = this.planService.getScenarioNameFromDisplayName(data);
      console.log(val);
      this.changeScenario(val);
    }
  }

 

  /** Changes the scenario when a scenario button is clicked.
   * @param scenarioName The name of the new scenario.
   */
  public changeScenario(scenarioName: string) {
    this.planService.setScenario(scenarioName);
    this.windowService.sendMessage({scenario: scenarioName});
  }

  /** Sends a message to the map.
   * @param idString A string that tells the map what the data will be.
   * @param data the actual data.
   */
  private notifyMap(idString: string, data: any): void {
    const msg = {
      type: idString,
      data: data, 
      newMsg: 'true'
    }
    this.windowService.sendMessage({message: msg});
  }

  public sendMessage(message: any) {
    this.windowService.sendMessage(message);

  }
}


