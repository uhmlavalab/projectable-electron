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

  constructor(private windowService: WindowService) { }

  ngOnInit() {

  }

  setAsMainWindow() {
    this.windowService.setAsMainWindow();
  }

  setAsMapWindow() {
    this.windowService.setAsMapWindow();
  }


}
