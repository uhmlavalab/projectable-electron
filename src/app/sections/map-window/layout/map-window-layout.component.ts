import { Component, OnInit, NgZone } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { WindowService } from '@app/modules/window';
import { PlanService } from '@app/services/plan.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-map-window-layout',
  templateUrl: './map-window-layout.component.html',
  styleUrls: ['./map-window-layout.component.css']
})
export class MapWindowLayoutComponent implements OnInit {
  private messageSub = new Subscription();
  constructor(private router: Router, private activeRoute: ActivatedRoute, private windowService: WindowService, private planService: PlanService, private ngZone: NgZone) {
    this.ngZone.run(() => {
      this.router.navigate(['waiting-screen'], { relativeTo: this.activeRoute });
    });
    this.messageSub = this.windowService.windowMessageSubject.subscribe(message => {
      if (message.type = 'state') {
        if (message.message == 'run') {
          this.messageSub.unsubscribe();

          this.planService.startTheMap(message.plan);
          this.ngZone.run(() => {
            this.router.navigate(['map-screen'], { relativeTo: this.activeRoute });
          });
          console.log('RUN RUN RUN')
        }
      }
    })
  }

  ngOnInit() {
  }

  reset() {
    this.windowService.resetAllWindows();
  }

  close() {   
    this.windowService.closeAppliction();
  }

  ngOnDestroy() {
    this.messageSub.unsubscribe();
  }

}
