import { Component, ViewChild, ElementRef, NgZone, OnInit } from '@angular/core';
import { WindowService } from '@app/modules/window';
import { PlanService } from '@app/services/plan.service';
import { Plan } from '@app/interfaces';
import { Router, ActivatedRoute } from '@angular/router';
import { ContentDeliveryService } from '@app/services/content-delivery.service';

@Component({
  selector: 'app-plan-selection',
  templateUrl: './plan-selection.component.html',
  styleUrls: ['./plan-selection.component.css']
})
export class PlanSelectionComponent implements OnInit {

  @ViewChild("mapViewNode", { static: true }) private mapViewEl: ElementRef;
  view: any;
  plans: Plan[];

  constructor(private windowService: WindowService, private planService: PlanService, private router: Router, private activeRoute: ActivatedRoute, private ngZone: NgZone, private contentDeliveryService: ContentDeliveryService) {
    this.windowService.loadFile('cssData.json');
    this.windowService.getPlanID();
  }

   ngOnInit(): void {
    this.plans = this.planService.getAllPlans();
    this.windowService.windowMessageSubject.subscribe(msg => {
      this.planService.handleMessage(msg);
    });
    this.windowService.planIdSubject.subscribe(val => {
      console.log(val);
      if (val > -1 && val < 3) {
        this.startPlan(val);
      }
    });
  }


  reset() {
    this.windowService.resetAllWindows();
  }

  startPlan(plan) {
    this.planService.startTheMap(this.plans[plan]);
    this.windowService.notifyMain_planIsSet(plan);
    this.ngZone.run(() => {
      this.reRoute('touch-ui');
    });
  }

  reRoute(route: string) {
    this.router.navigate([`../${route}`], { relativeTo: this.activeRoute });
  }
}
