import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-border-line',
  templateUrl: './border-line.component.html',
  styleUrls: ['./border-line.component.css']
})
export class BorderLineComponent implements OnInit {
  @Input() leftColor: string;
  @Input() rightColor: string;
  @Input() dotColor: string;
  @Input() dotSize: string;
  @Input() longSide: string;

  constructor() { }

  ngOnInit() {
  }

}
