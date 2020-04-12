import { Component, AfterViewInit, ViewChild, ElementRef, ViewChildren, QueryList } from '@angular/core';
import { PlanService } from '@app/services/plan.service';

@Component({
  selector: 'app-year',
  templateUrl: './year.component.html',
  styleUrls: ['./year.component.css']
})

/** This component is the center graphic.  It has a vizualization of the renewable energy percentage by year in a circle around
 * the center text display.
 */
export class YearComponent implements AfterViewInit {

  @ViewChild('wrapper', { static: false }) wrapperElement: ElementRef;             // A wrapper around the text elements in the center.
  @ViewChild('yearWrapper', { static: false }) yearWrapperElement: ElementRef;     // A wrapper around the year bars.
  @ViewChildren('yearBar', { read: ElementRef }) yearBars: QueryList<ElementRef>;  // QueryList containing the year bars.

  private displayData: {year: number; percentRenewable: number; scenario: string; };  // All Display Data
  private years: number[];           // Array for all possible years. (used to populate year-bar components.)
  private barLength: number;         // Length of the year bar.

  constructor(private planService: PlanService) {
    this.years = [];
    this.barLength = 40;
    this.displayData = {year: 2016, percentRenewable: 0, scenario: ''};
  }

  ngAfterViewInit() {
    this.positionYearWrapper();

    this.planService.yearSubject.subscribe(year => {
      if (year) {
        this.displayData.year = year;
      }
    });

    this.planService.precentRenewableByYearSubject.subscribe(percent => {
      if (percent) {
        this.displayData.percentRenewable = percent;
        if (percent === 0) {
          setTimeout( () => {
            this.planService.updateYear(this.displayData.year, false);
          }, 5000);
        }
      }
    });

    this.planService.scenarioSubject.subscribe(scenario => {
      if (scenario) {
        this.displayData.scenario = scenario.displayName;
      }
    });


    this.planService.yearsSubject.subscribe(years => {
      if (years) {
        this.years = years;  // Sets years.  It is used to populate the year-bars.
        setTimeout(() => {
          this.positionElements();
        }, 500);
      }
    });
  }

  /** Moves the year wrapper to the proper location. */
  private positionYearWrapper(): void {
    const top = this.wrapperElement.nativeElement.getBoundingClientRect().top - this.yearWrapperElement.nativeElement.getBoundingClientRect().top;
    const left = this.wrapperElement.nativeElement.getBoundingClientRect().left - this.yearWrapperElement.nativeElement.getBoundingClientRect().left;

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
    this.planService.finishedYearBarSetup(); // Set the data in the plan Service.
  }
}