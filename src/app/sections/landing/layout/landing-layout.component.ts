import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ipcRenderer } from 'electron';

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
  mainWindowSet = false;
  mapWindowSet = false;

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

  constructor(private router: Router, private activeRoute: ActivatedRoute, private detectorRef: ChangeDetectorRef) {

  }

  ngOnInit() {
    this.navigateTo(this.navButtons[0]);
    ipcRenderer.on('main-window-data', (event, message) => this.confirmMainWindow(message));
    ipcRenderer.on('map-window-data',  (event, message) => this.confirmMapWindow(message));
  }

  navigateTo(button: NavButton): void {
    this.router.navigate([button.routeName], { relativeTo: this.activeRoute });
    this.routeTitle = button.name;
  }

  close() {
    ipcRenderer.send('close');
  }

  setAsMainWindow() {
    ipcRenderer.send('set-as-main-window');
  }

  confirmMainWindow(message: string) {
    console.log(message);
    this.windowSet = true;
    this.mainWindowSet = true;
    ipcRenderer.removeListener('map-window-data', () => this.confirmMapWindow(null));
    ipcRenderer.removeListener('main-window-data', () => this.confirmMainWindow(null));
    this.detectorRef.detectChanges();

  }

  setAsMapWindow() {
    ipcRenderer.send('set-as-map-window');
  }

  confirmMapWindow(message: string) {
    console.log(message);
    this.windowSet = true;
    this.mapWindowSet = true;
    ipcRenderer.removeListener('map-window-data', () => this.confirmMapWindow(null));
    ipcRenderer.removeListener('main-window-data', () => this.confirmMainWindow(null));
    this.detectorRef.detectChanges();
  }

}
