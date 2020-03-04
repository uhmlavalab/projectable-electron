import { Component, NgZone, OnDestroy } from '@angular/core';
import { WindowService } from '@app/modules/window';
import { ActivatedRoute, Router } from '@angular/router';
import { PlanService } from '@app/services/plan.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-screen-selection',
  templateUrl: './screen-selection.component.html',
  styleUrls: ['./screen-selection.component.css']
})
export class ScreenSelectionComponent implements OnDestroy {

  messageSub: Subscription;

  constructor(private router: Router, private activeRoute: ActivatedRoute, private windowService: WindowService, private ngZone: NgZone, private planService: PlanService) {
    this.ngZone.run(() => {
      this.router.navigate(['screen-selection'], { relativeTo: this.activeRoute });
    });
  }
  ngOnInit(): void {
    this.messageSub = this.windowService.windowMessageSubject.subscribe(msg => {
      this.planService.handleMessage(msg);
    });
  }

  ngOnDestroy() {
    if (this.messageSub) {
      this.messageSub.unsubscribe();

    }
  }

  setAsMainWindow() {
    this.windowService.setAsMainWindow();

  }

  setAsMapWindow() {
    this.windowService.setAsMapWindow();
  } 

}
