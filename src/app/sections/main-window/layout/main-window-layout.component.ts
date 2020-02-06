import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { WindowService } from '@app/modules/window';

@Component({
  selector: 'app-main-window-layout',
  templateUrl: './main-window-layout.component.html',
  styleUrls: ['./main-window-layout.component.css']
})
export class MainWindowLayoutComponent {

  constructor(private router: Router, private activeRoute: ActivatedRoute, private windowService: WindowService) {
    this.router.navigate(['plan-selection'], { relativeTo: this.activeRoute });
  }

  reset() {
    this.windowService.resetAllWindows();
  }

  close() {
    this.windowService.closeAppliction();
  }

}
