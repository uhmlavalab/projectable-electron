import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-text-title',
  templateUrl: './text-title.component.html',
  styleUrls: ['./text-title.component.css']
})
export class TextTitleComponent implements OnInit {

  @Input() title: string;
  @Input() subtitle: string;
  @Input() titleSize: number;
  @Input() subtitleSize: number;

  constructor() { }

  ngOnInit() {
  }

}
