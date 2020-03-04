import { Component, NgZone } from '@angular/core';
import { WindowService } from '@app/modules/window';
import { ActivatedRoute, Router } from '@angular/router';
import { PlanService } from '@app/services/plan.service';

@Component({
  selector: 'app-screen-selection',
  templateUrl: './screen-selection.component.html',
  styleUrls: ['./screen-selection.component.css']
})
export class ScreenSelectionComponent  {

  constructor(private router: Router, private activeRoute: ActivatedRoute, private windowService: WindowService, private ngZone: NgZone, private planService: PlanService) {
    this.ngZone.run(() => {
      this.router.navigate(['screen-selection'], { relativeTo: this.activeRoute });
    });
  }
  ngOnInit(): void {
  this.windowService.windowMessageSubject.subscribe(msg => {
    this.planService.handleMessage(msg);
  });
}

  setAsMainWindow() {
    this.windowService.setAsMainWindow();
    
  }

  setAsMapWindow() {
    this.windowService.setAsMapWindow();
  }

}
