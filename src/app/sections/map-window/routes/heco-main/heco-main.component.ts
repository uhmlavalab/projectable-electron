import { Component, AfterViewInit, OnDestroy, ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { PlanService } from '@app/services/plan.service';
import { Router } from '@angular/router';
import { WindowService } from '@app/modules/window';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-heco-main',
  templateUrl: './heco-main.component.html',
  styleUrls: ['./heco-main.component.css']
})
export class HecoMainComponent implements AfterViewInit, OnDestroy {

  @ViewChild('map', { static: false, read: ElementRef }) mapElement;
  @ViewChild('pieChart', { static: false, read: ElementRef }) pieChart; // The custom Map component.
  @ViewChild('lineChart', { static: false, read: ElementRef }) lineChart; // The custom Map component.
  @ViewChild('yearData', {static: false, read: ElementRef}) yearData;

  private positionData: any;

  private messageSub = new Subscription();

  constructor(private planService: PlanService, private windowService: WindowService) {
    this.positionData = {};
    this.positionData.line = {};
    this.positionData.pie = {};
    this.positionData.map = {};
  }

  ngAfterViewInit() {

    this.windowService.windowMessageSubject.subscribe(msg => {
      this.planService.handleMessage(msg);
    });

    this.planService.positionSubject.subscribe(data => {
      if (data) {
        let e = this.mapElement.nativeElement;
        if (data.id === 'pie') {
          e = this.pieChart.nativeElement;
        } else if (data.id === 'line') {
          e = this.lineChart.nativeElement;
        }

        const rect = e.getBoundingClientRect();
        e.style.left = `${data.x - rect.width / 2}px`;
        e.style.top = `${data.y - rect.height / 2}px`;
        this.positionData[data.id] = { x: data.x - rect.width / 2, y: data.y - rect.height / 2 };
        this.planService.updatePositionData(this.positionData);
      }
    });

    this.planService.cssSubject.subscribe(cssData => {
      if (cssData) {
        if (!this.windowService.isMain()) {
          this.positionMap(cssData.map);
          this.positionLineChart(cssData.charts.line);
          this.positionPieChart(cssData.charts.pie);
          this.positionYearData(cssData.mapYearData);
        }
      }
    });
  }
  ngOnDestroy() {
    this.messageSub.unsubscribe();
  }

  private positionMap(css: any): void {
    try {
      //Select map element from viewchild
      const e = this.mapElement.nativeElement;
      e.style.left = css.left;
      e.style.top = css.top;
    } catch (error) {
      console.log('Failed To locate Element to position');
    }
  }

  private positionLineChart(css: any): void {
    try {
      //Select map element from viewchild
      const e = this.lineChart.nativeElement;
      e.style.left = css.left;
      e.style.top = css.top;
    } catch (error) {
      console.log('Error.  Failed to find element to position.');
    }
  }

  private positionPieChart(css: any): void {
    try {
      //Select map element from viewchild
      const e = this.pieChart.nativeElement;
      e.style.left = css.left;
      e.style.top = css.top;
    } catch (error) {
      console.log('Error. Failed to find the element to position. ');
    }
  }

  private positionYearData(css: any): void {
    try {
      //Select map element from viewchild
      console.log(css);
      const e = this.yearData.nativeElement;
      e.style.left = css.left;
      e.style.top = css.top;
    } catch (error) {
      console.log('Error.  Failed to find year data element to position.');
    }
  }

}
