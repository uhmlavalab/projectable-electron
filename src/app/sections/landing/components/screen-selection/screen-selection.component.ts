import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ipcRenderer } from 'electron';
import { WindowService } from '@app/modules/window';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-screen-selection',
  templateUrl: './screen-selection.component.html',
  styleUrls: ['./screen-selection.component.css']
})
export class ScreenSelectionComponent implements OnInit {

  constructor(private windowService: WindowService, private router: Router, private detectorRef: ChangeDetectorRef) { }

  ngOnInit() {
    ipcRenderer.on('main-window-confirmation', (event, message) => this.confirmMainWindow());
    ipcRenderer.on('map-window-confirmation',  (event, message) => this.confirmMapWindow());
  }

  setAsMainWindow() {
    ipcRenderer.send('set-main-window');
  }

  setAsMapWindow() {
    ipcRenderer.send('set-map-window'); 
  }

  confirmMainWindow() {
    ipcRenderer.removeListener('map-window-confirmation', () => this.confirmMapWindow());
    ipcRenderer.removeListener('main-window-confirmation', () => this.confirmMainWindow());
    this.windowService.setAsMainWindow();
    this.router.navigate(['main-window']);
    this.detectorRef.detectChanges();
  }

  confirmMapWindow() {
    ipcRenderer.removeListener('map-window-confirmation', () => this.confirmMapWindow());
    ipcRenderer.removeListener('main-window-confirmation', () => this.confirmMainWindow());
    this.windowService.setAsMapWindow();
    this.router.navigate(['map-window']);
    this.detectorRef.detectChanges();

  }

}
