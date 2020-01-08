import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ipcRenderer } from 'electron';
import { WindowService } from '@app/modules/window';
import { Subscriber, Subscription } from 'rxjs';

interface NavButton {
  name: string;
  routeName: string;
}
@Component({
  selector: 'app-landing-layout',
  templateUrl: './landing-layout.component.html',
  styleUrls: ['./landing-layout.component.css']
})
export class LandingLayoutComponent implements OnInit {

  title = 'ProjecTable';
  titleFreq = 4;

  routeTitle = 'Plan List';
  windowSet = false;
  windowSetSub: Subscription;

  navButtons = [
    {
      name: 'Plan List',
      routeName: 'planlist'
    },
    {
      name: 'Create New Plan',
      routeName: 'newplan'

    },
    {
      name: 'Edit Plan',
      routeName: 'editplan'

    }
  ] as NavButton[];

  constructor(private router: Router, private activeRoute: ActivatedRoute, private detectorRef: ChangeDetectorRef, private windowService: WindowService) {
    this.routeTitle = 'Screen Selection';
    this.router.navigate(['screenselection'], { relativeTo: this.activeRoute });

  }

  ngOnInit() {
    this.windowSetSub = this.windowService.windowSet.subscribe(value => {
      this.windowSet = value;
      if (this.windowSet) {
        this.navigateTo(this.navButtons[0]);
        this.windowSetSub.unsubscribe();
      }
    })
  }

  navigateTo(button: NavButton): void {
    this.router.navigate([button.routeName], { relativeTo: this.activeRoute });
    this.routeTitle = button.name;
  }

  close() {
    ipcRenderer.send('close');
  }

}
