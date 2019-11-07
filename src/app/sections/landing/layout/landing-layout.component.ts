import { Component, OnInit } from '@angular/core';
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

  constructor(private router: Router, private activeRoute: ActivatedRoute) {
    ipcRenderer.on('fileSaved', (event, msg) => {
      console.log(msg)}
      );
   }

  ngOnInit() {
    this.navigateTo(this.navButtons[0]);
  }

  navigateTo(button: NavButton): void {
    this.router.navigate([button.routeName], { relativeTo: this.activeRoute });
    this.routeTitle = button.name;
    ipcRenderer.send('saveFile', { name: 'Oahu', description: 'Oahu'});
  }
  close() {
    ipcRenderer.send('close');
  }


}
