import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-edit-plan',
  templateUrl: './edit-plan.component.html',
  styleUrls: ['./edit-plan.component.css']
})
export class EditPlanComponent implements OnInit {

  value = "cat";

  x = 5;
  constructor() { }

  ngOnInit() {
  }

  process() {
    console.log(this.test(this.value));
  }

  test(value: string) {
    const func = Function('obj', `"use strict";${value}`);
    return func(this);
  }
}
