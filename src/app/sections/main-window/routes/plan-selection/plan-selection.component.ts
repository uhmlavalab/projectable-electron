import { Component, ViewChild, ElementRef } from '@angular/core';
import { WindowService } from '@app/modules/window';
import { PlanService } from '@app/services/plan.service';
import { ContentDeliveryService } from '@app/services/content-delivery.service';
import { Plan } from '@app/interfaces';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-plan-selection',
  templateUrl: './plan-selection.component.html',
  styleUrls: ['./plan-selection.component.css']
})
export class PlanSelectionComponent  {

  @ViewChild("mapViewNode", { static: true }) private mapViewEl: ElementRef;
  view: any;
  plans: Plan[];

  constructor(private windowService: WindowService, private planService: PlanService, private router: Router, private activeRoute: ActivatedRoute, ) {
    this.plans = this.planService.getPlans();
   }


  reset() {
    this.windowService.resetAllWindows();
  }

  startPlan(plan) {
    console.log(this.plans[0])
    this.planService.startTheMap(this.plans[0]);
    this.reRoute('touch-ui')
  }

  reRoute(route: string) {
    console.log(route);
    this.router.navigate([`../${route}`], { relativeTo: this.activeRoute });
  }
}
