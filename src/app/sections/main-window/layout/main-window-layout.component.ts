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

  reRoute(route: string) {
    this.router.navigate([route], { relativeTo: this.activeRoute });
  }

}
