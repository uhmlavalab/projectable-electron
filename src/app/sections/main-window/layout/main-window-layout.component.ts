import { Component, NgZone } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { WindowService } from '@app/modules/window';

@Component({
  selector: 'app-main-window-layout',
  templateUrl: './main-window-layout.component.html',
  styleUrls: ['./main-window-layout.component.css']
})
export class MainWindowLayoutComponent {

  constructor(private router: Router, private activeRoute: ActivatedRoute, private windowService: WindowService, private ngZone: NgZone) {
    this.ngZone.run(() => {
      this.reRoute('plan-selection');
    });

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
