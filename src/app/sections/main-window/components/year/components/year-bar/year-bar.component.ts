import { Component, AfterViewInit, Input, ViewChild, ElementRef, QueryList, ViewChildren, ChangeDetectorRef, HostListener } from '@angular/core';
import { PlanService } from '@app/services/plan.service';
import { addListener } from 'cluster';

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
  private inputData: any;
  private scenario: any;
  private allReady: any;
  private set: boolean;
  private total: number;

  constructor(private planService: PlanService, private ref: ChangeDetectorRef) {
    this.year = 2016;
    this.techArray = [0];
    this.allReady = {};
    this.allReady.dataSet = false;
    this.allReady.scenarioSet = false;
    this.allReady.techArraySet = false;
    this.set = false;
    this.total = 0;
  }

  ngAfterViewInit() {
    this.planService.scenarioSubject.subscribe(scenario => {
      if (scenario) {
        this.scenario = scenario;
        this.allReady.scenarioSet = true;
        if (this.set || (!this.set && this.componentIsReady())) {
          this.setBarLength();
        }
      }
    });

    this.planService.yearSubject.subscribe(year => {
      if (year) {
        this.year = year;
        this.allReady.yearSet = true;
        if (!this.set && this.componentIsReady()) {
          this.setBarLength();
        }
      }
    });

    this.planService.technologySubject.subscribe(technologyArray => {
      if (technologyArray) {
        this.allReady.techArraySet = true;
        this.techArray = technologyArray;
        this.ref.detectChanges();
        if (!this.set && this.componentIsReady()) {
          this.setBarLength();
        }
      }
    });

    this.planService.genDataSubject.subscribe(data => {
      if (data) {
        this.inputData = data;
        this.allReady.dataSet = true;
        if (!this.set && this.componentIsReady()) {
          this.setBarLength();
        }
      }
    });
  }

  private componentIsReady(): boolean {
    if (this.allReady.dataSet && this.allReady.scenarioSet && this.allReady.techArraySet) {
      this.set = true;
    }
    return this.set;
  }

  private setBarLength(): void {
    const sizes = [];
    let total = 0;
    let values = 0;
    let fossil = 0;
    Object.keys(this.inputData[this.scenario.name]).forEach(tech => {
      this.inputData[this.scenario.name][tech].forEach(year => {
        if (year.year == this.data) {
          total += year.value;
          sizes.push({ name: tech, value: year.value });
        }
      });
    });
    setTimeout(() => {
      this.rects.forEach((e, index) => {
        if (sizes[index].name !== 'Fossil') {
          e.nativeElement.style.width = `${Math.round(sizes[index].value / total * 99)}%`;
          e.nativeElement.style.backgroundColor = this.techArray[index].color;
          values += sizes[index].value;
        }
      });
      this.total = Math.round(values/total * 100);
      this.planService.updateTotal(this.total, this.data);
    }, 10);
  }

  @HostListener('click', ['$event.target'])
  onClick() {
    this.planService.updateYear(this.data);
   }

   @HostListener('touchStart', ['$event.target'])
   onTouchStart() {
     this.planService.updateYear(this.data);
    }
}
