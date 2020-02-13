import { Component, NgZone } from '@angular/core';
import { WindowService } from '@app/modules/window';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-screen-selection',
  templateUrl: './screen-selection.component.html',
  styleUrls: ['./screen-selection.component.css']
})
export class ScreenSelectionComponent  {

  constructor(private router: Router, private activeRoute: ActivatedRoute, private windowService: WindowService, private ngZone: NgZone) {
    this.ngZone.run(() => {
      this.router.navigate(['screen-selection'], { relativeTo: this.activeRoute });
    });
  }

  setAsMainWindow() {
    this.windowService.setAsMainWindow();
    
  }

  setAsMapWindow() {
    this.windowService.setAsMapWindow();
  }

}
