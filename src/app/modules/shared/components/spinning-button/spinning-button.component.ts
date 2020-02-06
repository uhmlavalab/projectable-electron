import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-spinning-button',
  templateUrl: './spinning-button.component.html',
  styleUrls: ['./spinning-button.component.css']
})
export class SpinningButtonComponent implements OnInit {

  @Input('text') text: string;
  @Input('color') loaderColor: string;

  constructor() { }

  ngOnInit() {
  }

}
