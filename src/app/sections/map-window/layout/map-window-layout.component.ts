import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { WindowService } from '@app/modules/window';

@Component({
  selector: 'app-map-window-layout',
  templateUrl: './map-window-layout.component.html',
  styleUrls: ['./map-window-layout.component.css']
})
export class MapWindowLayoutComponent implements OnInit {

  constructor(private router: Router, private activeRoute: ActivatedRoute, private windowService: WindowService) {
    this.router.navigate(['waiting-screen'], { relativeTo: this.activeRoute });
  }

  ngOnInit() {
  }

  reset() {
    this.windowService.resetAllWindows();
  }

  close() {
    this.windowService.closeAppliction();
  }

}
