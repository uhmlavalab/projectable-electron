import { Component, AfterViewInit, Input, ViewChild, ElementRef, QueryList, ViewChildren, ChangeDetectorRef } from '@angular/core';
import { PlanService } from '@app/services/plan.service';

@Component({
  selector: 'app-year-bar',
  templateUrl: './year-bar.component.html',
  styleUrls: ['./year-bar.component.css']
})
export class YearBarComponent implements AfterViewInit {

  @Input() data: number;
  @ViewChildren('rectangle', { read: ElementRef }) rects: QueryList<ElementRef>
  private year: number;
  private techArray: any[];

  constructor(private planService: PlanService, private ref: ChangeDetectorRef) {
    this.year = null;
    this.techArray = [0];
  }

  ngAfterViewInit() {
    this.planService.scenarioSubject.subscribe(scenario => this.setBarLength(scenario));
    this.planService.yearSubject.subscribe(year => {
      this.year = year;
    });
    this.planService.technologySubject.subscribe(technologyArray => {
      this.techArray = technologyArray;
      this.ref.detectChanges();
    });
  }

  private setBarLength(scenario): void {
    const sizes = [];
    this.planService.getGenerationData().then(genData => {
      let total = 0;
      let fossil = 0;
      Object.keys(genData[scenario.name]).forEach(tech => {
        genData[scenario.name][tech].forEach(year => {
          if (year.year == this.data) {
            total += year.value;
            sizes.push({ name: tech, value: year.value });
          }
        });
      });
      setTimeout(() => {
        this.rects.forEach((e, index) => {
          if (sizes[index].name !== 'Fossil') {
          e.nativeElement.style.width = `${Math.round( sizes[index].value / total * 99)}%`;
          e.nativeElement.style.backgroundColor = this.techArray[index].color;
          }
        });
      }, 10);

    });

  }

}
