import { Component, NgZone } from '@angular/core';
import { WindowService } from '@app/modules/window';
import { Router, ActivatedRoute } from '@angular/router';

interface NavButton {
  name: string;
  routeName: string;
}
@Component({
  selector: 'app-landing-layout',
  templateUrl: './landing-layout.component.html',
  styleUrls: ['./landing-layout.component.css']
})
export class LandingLayoutComponent {

  title = 'HecoTable';
  titleFreq = 4;

  constructor(private router: Router, private activeRoute: ActivatedRoute, private windowService: WindowService, private ngZone: NgZone) {
    this.ngZone.run(() => {
      this.router.navigate(['screen-selection'], { relativeTo: this.activeRoute });
    });
  }

  reset() {
    this.windowService.resetAllWindows();
  }

  close() {
    this.windowService.closeAppliction();
  }

}
