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

  private uiWindow: any;
  private currentYear: number;          // Current Year
  private currentScenario: string;      // Current scenario.
  private messageCheckInterval: any;    // How often to check the local storage for messages (in Milliseconds.)

  private messageSub = new Subscription();

  constructor(private planService: PlanService, private windowService: WindowService) {
    this.currentYear = 9999;
  }

  ngAfterViewInit() {
    // Map and Charts are positioned from CSS data from the plan.
    this.positionMap();
    this.positionTopChart();
    this.positionBottomChart();

  
    this.windowService.windowMessageSubject.subscribe(msg => {
      this.planService.handleMessage(msg);
    });

    // Subscribe to scenario Changes.
    this.planService.scenarioSubject.subscribe(scenario => {
      if (scenario) {
        this.currentScenario = scenario.displayName;
      }
    });

    // Subscribe to changes in the year.
    this.planService.yearSubject.subscribe(year => {
      if (year) {
        this.currentYear = year;
      }
    });
  }
  ngOnDestroy() {
    this.messageSub.unsubscribe();
  }


  private positionMap(): void {
    try {
      //Select map element from viewchild
      const e = this.mapElement.nativeElement;
      // Get styles from the plan service.
      // const styles = this.planService.getCss();
      // e.style.left = styles.map.left;
      // e.style.top = styles.map.top;
    } catch (error) {
      console.log('Failed To locate Element to position');
    }
  }

  private positionTopChart(): void {
    try {
      //Select map element from viewchild

      const e = this.lineChart.nativeElement;
      // Get styles from the plan service.
      // const styles = this.planService.getCss();
      // e.style.left = styles.charts.line.left;
      // e.style.top = styles.charts.line.top;
    } catch (error) {
      console.log('Error.  Failed to find element to position.');
    }
  }

  private positionBottomChart(): void {
    try {
      //Select map element from viewchild
      const e = this.pieChart.nativeElement;
      // Get styles from the plan service.
      // const styles = this.planService.getCss();
      // e.style.left = styles.charts.pie.left;
      // e.style.top = styles.charts.pie.top;
    } catch (error) {
      console.log('Error. Failed to find the element to position. ');
    }
  }
}
