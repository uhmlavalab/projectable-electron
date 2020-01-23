import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-main-window-layout',
  templateUrl: './main-window-layout.component.html',
  styleUrls: ['./main-window-layout.component.css']
})
export class MainWindowLayoutComponent implements OnInit {

  constructor(private router: Router, private activeRoute: ActivatedRoute) {
    this.router.navigate(['plan-selection'],  { relativeTo: this.activeRoute});
   }

  ngOnInit() {
  }

}
