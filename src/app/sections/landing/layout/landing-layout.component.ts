import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ipcRenderer } from 'electron';
import { WindowService } from '@app/modules/window';
import { Subscription } from 'rxjs';


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

  windowSet = false;
  windowSetSub: Subscription;

  constructor(private router: Router, private activeRoute: ActivatedRoute, private detectorRef: ChangeDetectorRef, private windowService: WindowService) {
  }

  ngOnInit() {

  }

  close() {
    ipcRenderer.send('close');
  }
  setAsMainWindow() {
    this.windowService.setAsMainWindow();
  }

  setAsMapWindow() {
    this.windowService.setAsMapWindow();
  }
}
