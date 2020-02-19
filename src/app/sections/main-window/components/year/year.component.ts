import { Component, AfterViewInit, ViewChild, ElementRef, ViewChildren, QueryList } from '@angular/core';
import { UiServiceService } from '@app/services/ui-service.service';
import { PlanService } from '@app/services/plan.service';

@Component({
  selector: 'app-year',
  templateUrl: './year.component.html',
  styleUrls: ['./year.component.css']
})
export class YearComponent implements AfterViewInit {

  @ViewChild('wrapper', { static: false }) wrapperElement: ElementRef;
  @ViewChild('yearWrapper', { static: false }) yearWrapperElement: ElementRef;
  @ViewChildren('yearBar', { read: ElementRef }) yearBars: QueryList<ElementRef>

  private year: number;
  private years: number[];
  private barLength: number;
  private genData: any;

  constructor(private planService: PlanService) {
    this.year = 999;
    this.years = [];
    this.barLength = 40;
    this.genData = null;
  }

  ngAfterViewInit() {
    this.positionYearWrapper();

    this.planService.yearSubject.subscribe(year => {
      if (year) {
        this.year = year;
      }
    });

    this.planService.yearsSubject.subscribe(years => {
      if (years) {
        this.years = years;
        setTimeout(() => {
          this.positionElements();
        }, 100);
      }
    });
  }

  private positionYearWrapper(): void {
    const top = this.wrapperElement.nativeElement.getBoundingClientRect().top - this.yearWrapperElement.nativeElement.getBoundingClientRect().top;
    const left = this.wrapperElement.nativeElement.getBoundingClientRect().left- this.yearWrapperElement.nativeElement.getBoundingClientRect().left;

    this.yearWrapperElement.nativeElement.style.left = `${left + this.yearWrapperElement.nativeElement.getBoundingClientRect().width / 2 - this.barLength / 2 + 1}px`;
    this.yearWrapperElement.nativeElement.style.top = `${top + this.yearWrapperElement.nativeElement.getBoundingClientRect().height / 2 - 4.5}px`;
  }


  /** Positions the nodes around the puck
 * @param elements the HTML elements to position.
 */
  private positionElements() {
    const angle = 360 / this.yearBars.length;
    let currentPosition = -90 + angle;
    const height = this.wrapperElement.nativeElement.getBoundingClientRect().height / 2;
    this.yearBars.forEach(e => {
      e.nativeElement.style.width = `${this.barLength}px`;
      e.nativeElement.style.transform = `rotate(${currentPosition}deg) translate(${height + this.barLength / 2}px)`;
      currentPosition += angle;
    });

  }
}