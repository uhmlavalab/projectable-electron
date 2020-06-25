import { Component, NgZone, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { WindowService } from '@app/modules/window';
import { PlanService } from '@app/services/plan.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-map-window-layout',
  templateUrl: './map-window-layout.component.html',
  styleUrls: ['./map-window-layout.component.css']
})
export class MapWindowLayoutComponent implements OnDestroy {
  private messageSub = new Subscription();
  // tslint:disable-next-line: max-line-length
  constructor(private router: Router, private activeRoute: ActivatedRoute, private windowService: WindowService, private planService: PlanService, private ngZone: NgZone) {
    this.ngZone.run(() => {
      this.router.navigate(['waiting-screen'], { relativeTo: this.activeRoute });
    });
    this.messageSub = this.windowService.windowMessageSubject.subscribe(message => {
      if (message.type = 'state') {
        if (message.message === 'run') {
          this.messageSub.unsubscribe();
          this.planService.startTheMap(message.plan);
          this.ngZone.run(() => {
            this.router.navigate(['map-screen'], { relativeTo: this.activeRoute });
          });
        }
      }
    });
  }

  ngOnDestroy() {
    this.messageSub.unsubscribe();
  }

}
