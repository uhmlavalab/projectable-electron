import { Component, OnInit } from '@angular/core';
import { PlanService } from '@app/services/plan.service';

@Component({
  selector: 'app-year-display',
  templateUrl: './year-display.component.html',
  styleUrls: ['./year-display.component.css']
})
export class YearDisplayComponent implements OnInit {

  year: number;
  private percentRenewable: number;
  constructor(private planService: PlanService) {
  }

  ngOnInit() {
    this.planService.yearSubject.subscribe(year => {
      if (year) {
        this.year = year;
      } else {
        this.year = 9999;
      }
    });

    this.planService.precentRenewableByYearSubject.subscribe(percent => {
      if (percent) {
        this.percentRenewable = percent;
      } else {
        this.percentRenewable = 0;
      }
    });
  }
}
