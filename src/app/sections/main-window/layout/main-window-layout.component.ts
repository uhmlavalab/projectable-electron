import { Component, NgZone } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { WindowService } from '@app/modules/window';
import { PlanService } from '@app/services/plan.service';

@Component({
  selector: 'app-main-window-layout',
  templateUrl: './main-window-layout.component.html',
  styleUrls: ['./main-window-layout.component.css']
})
export class MainWindowLayoutComponent {

  constructor(private router: Router, private activeRoute: ActivatedRoute, private windowService: WindowService, private ngZone: NgZone,
    private planService: PlanService) {
    this.ngZone.run(() => {
      this.reRoute('plan-selection');
    });

  }

  resetCSS() {
    if (confirm('Resetting CSS Data is permanent.  Click confirm to proceed.')){
      this.planService.createCssData();
      alert('CSS File Reset.  Restart application to view changes.');
    }
  }

  reset() {
    this.windowService.resetAllWindows();
  }

  close() {
    this.windowService.closeAppliction();
  }

  reRoute(route: string) {
    this.router.navigate([route], { relativeTo: this.activeRoute });
  }

}
