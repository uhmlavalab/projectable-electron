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
    this.plans = Plans; // All Plans
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


