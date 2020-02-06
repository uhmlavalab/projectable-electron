import { Component, OnInit } from '@angular/core';
import { PlanService } from '@app/services/plan.service';

@Component({
  selector: 'app-year-display',
  templateUrl: './year-display.component.html',
  styleUrls: ['./year-display.component.css']
})
export class YearDisplayComponent implements OnInit {

  year: number;

  constructor(private planService: PlanService) {
    this.year = this.planService.getMinimumYear();
  }

  ngOnInit() {
    this.planService.yearSubject.subscribe(year => {
      if (year) {
        this.year = year;
      }
    });
  }
}
