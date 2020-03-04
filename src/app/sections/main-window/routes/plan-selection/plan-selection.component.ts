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
    //  const jsonfile = {
    //   file: 'cssData', 
    //   css: {
    //   map: {
    //     left: '3vw',
    //     top: '1vh'
    //   },
    //   legend: {
    //     display: 'none',
    //     defaultLayout: 'vertical',
    //     grid: {
    //       left: '28vw',
    //       top: '2vh',
    //       width: '26vw'
    //     },
    //     vertical: {
    //       left: '26vw',
    //       top: '3vh',
    //       width: '10vw'
    //     }
    //   },
    //   title: {
    //     left: '10vw',
    //     top: '2vh'
    //   },
    //   scenario: {
    //     left: '6vw',
    //     top: '8vh'
    //   },
    //   charts: {
    //     pie: {
    //       left: '5vw',
    //       top: '66vh'
    //     },
    //     line: {
    //       left: '50vw',
    //       top: '1vh'
    //     }
    //   }
    // }};
    // this.windowService.saveFile({ filename: 'cssData.json', file: JSON.stringify(jsonfile) });
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
