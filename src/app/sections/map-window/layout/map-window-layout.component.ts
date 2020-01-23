import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-map-window-layout',
  templateUrl: './map-window-layout.component.html',
  styleUrls: ['./map-window-layout.component.css']
})
export class MapWindowLayoutComponent implements OnInit {

  constructor(private router: Router, private activeRoute: ActivatedRoute) {
    this.router.navigate(['waiting-screen'], { relativeTo: this.activeRoute });
  }

  ngOnInit() {
  }

}
