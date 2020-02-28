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

  private positionData: any;

  private messageSub = new Subscription();

  constructor(private planService: PlanService, private windowService: WindowService) {
    this.positionData = {};
  }

  ngAfterViewInit() {
    // Map and Charts are positioned from CSS data from the plan.
    this.positionMap();
    this.positionTopChart();
    this.positionBottomChart();

  
    this.windowService.windowMessageSubject.subscribe(msg => {
      this.planService.handleMessage(msg);
    });

    this.planService.positionSubject.subscribe(data => {
      if (data) {
        let e = this.mapElement.nativeElement;
        if (data.id === 'pie') {
          e =this.pieChart.nativeElement;
        } else if (data.id === 'line') {
          e = this.lineChart.nativeElement;
        }
  
        const rect = e.getBoundingClientRect();
        e.style.left = `${data.x - rect.width / 2}px`;
        e.style.top = `${data.y - rect.height / 2}px`;
        this.positionData[data.id] = {x: data.x - rect.width / 2, y: data.y - rect.height / 2};
      }
    });
    this.planService.updatePositionData(this.positionData);
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
