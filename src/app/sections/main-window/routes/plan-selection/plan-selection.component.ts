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
   }

   ngOnInit(): void {
    this.plans = this.planService.getAllPlans();
    this.windowService.windowMessageSubject.subscribe(msg => {
      this.planService.handleMessage(msg);
    });
  }


  reset() {
    this.windowService.resetAllWindows();
  }

  startPlan(plan) {
    this.planService.startTheMap(this.plans[0]);
    this.ngZone.run(() => {
      this.reRoute('touch-ui')
    });
  }

  reRoute(route: string) {
    this.router.navigate([`../${route}`], { relativeTo: this.activeRoute });
  }
}
