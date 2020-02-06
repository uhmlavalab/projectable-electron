import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-menu-option',
  templateUrl: './menu-option.component.html',
  styleUrls: ['./menu-option.component.css']
})
export class MenuOptionComponent implements OnInit {
  @Input() text: string;
  @Input() type: string;

  constructor() { }

  ngOnInit() {
  }

}
