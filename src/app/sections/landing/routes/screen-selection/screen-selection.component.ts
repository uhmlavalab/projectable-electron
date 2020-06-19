import { Component, NgZone, OnInit} from '@angular/core';
import { WindowService } from '@app/modules/window';
import { ActivatedRoute, Router } from '@angular/router';
import { PlanService } from '@app/services/plan.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-screen-selection',
  templateUrl: './screen-selection.component.html',
  styleUrls: ['./screen-selection.component.css']
})
export class ScreenSelectionComponent implements OnInit{

  private numWindows: number;

  constructor(private router: Router, private activeRoute: ActivatedRoute, private windowService: WindowService, private ngZone: NgZone) {
    this.ngZone.run(() => {
      this.router.navigate(['screen-selection'], { relativeTo: this.activeRoute });
    });
    this.numWindows = 0;
  }

  ngOnInit() {
    this.windowService.numWindowsSubject.subscribe(val => {
     this.numWindows = val;
    });
  }

  removeWindow() {
    this.windowService.removeWindow();
  }
  
  setAsMainWindow() {
    this.windowService.setAsMainWindow();
  }

  setAsMapWindow() {
    this.windowService.setAsMapWindow();
  }

}
