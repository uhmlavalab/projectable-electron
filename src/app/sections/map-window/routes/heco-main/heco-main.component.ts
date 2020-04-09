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
  @ViewChild('yearData', { static: false, read: ElementRef }) yearData;
  @ViewChild('hecoLogo', { static: false, read: ElementRef }) hecoLogo;
  @ViewChild('lavaLogo', { static: false, read: ElementRef }) lavaLogo;

  private positionData: any;
  private messageSub = new Subscription();
  private cssData: any;

  constructor(private planService: PlanService, private windowService: WindowService) {
    this.positionData = {};
    this.positionData.line = {};
    this.positionData.pie = {};
    this.positionData.map = {};
    this.positionData.lava = {};
    this.positionData.displayData = {};
    this.positionData.heco = {};
    this.cssData = null;
  }

  ngAfterViewInit() {

    this.windowService.windowMessageSubject.subscribe(msg => {
      this.planService.handleMessage(msg);
    });

    this.planService.resizeSubject.subscribe(data => {
      if (data) {
        if (data.id === 'resize lava') {
          this.resizeElement(this.lavaLogo.nativeElement, 'logos', 'lava', data.width, data.height, data.percent);
        } else if (data.id === 'resize heco') {
          this.resizeElement(this.hecoLogo.nativeElement, 'logos', 'heco', data.width, data.height, data.percent);
        } else if (data.id === 'resize data') {
          this.resizeElement(this.yearData.nativeElement, null, 'data', data.width, data.height, data.percent);
        }
      }
    });

    this.planService.positionSubject.subscribe(data => {
      if (data) {
        if (data.x && data.y) {
          let e = this.mapElement.nativeElement;
          if (data.id === 'pie') {
            e = this.pieChart.nativeElement;
          } else if (data.id === 'line') {
            e = this.lineChart.nativeElement;
          } else if (data.id === 'displayData') {
            e = this.yearData.nativeElement;
          } else if (data.id === 'lava') {
            e = this.lavaLogo.nativeElement;
          } else if (data.id === 'heco') {
            e = this.hecoLogo.nativeElement;
          }
          const rect = e.getBoundingClientRect();
          e.style.left = `${data.x - rect.width / 2}px`;
          e.style.top = `${data.y - rect.height / 2}px`;
          this.positionData[data.id] = { x: data.x - rect.width / 2, y: data.y - rect.height / 2 };
          this.planService.updatePositionData(this.positionData);
        }
      }
    });

    this.planService.revertPositionsSubject.subscribe(val => {
      if (val) {
        if (!this.windowService.isMain()) {
          this.positionAll(this.cssData);
        }
      }
    });

    this.planService.cssSubject.subscribe(cssData => {
      if (cssData) {
        this.cssData = cssData;
        if (!this.windowService.isMain()) {
          this.positionAll(cssData);
        }
      }
    });
  }
  ngOnDestroy() {
    this.messageSub.unsubscribe();
  }

  positionAll(cssData) {
    this.positionElement(cssData.map, this.mapElement.nativeElement);
    this.positionElement(cssData.charts.line, this.lineChart.nativeElement);
    this.positionElement(cssData.charts.pie, this.pieChart.nativeElement);
    this.positionElement(cssData.data, this.yearData.nativeElement);
    this.positionElement(cssData.logos.lava, this.lavaLogo.nativeElement);
    this.positionElement(cssData.logos.heco, this.hecoLogo.nativeElement);
    setTimeout(() => {
      this.resizeElement(this.yearData.nativeElement, null, 'data', cssData.data.width, cssData.data.height, cssData.data.percent);
      // tslint:disable-next-line: max-line-length
      this.resizeElement(this.lavaLogo.nativeElement, 'logos', 'lava', cssData.logos.lava.width, cssData.logos.lava.height, cssData.logos.lava.percent);
      // tslint:disable-next-line: max-line-length
      this.resizeElement(this.hecoLogo.nativeElement, 'logos', 'heco', cssData.logos.heco.width, cssData.logos.heco.height, cssData.logos.heco.percent);
    }, 500);
  }

  resizeElement(e: any, category: string, elementName: string, width: number, height: number, percentage: any) {
    if (!width || !height) {
      width = 0;
      height = 0;
    }
    if (width === 0 || height === 0) {
      width = e.getBoundingClientRect().width;
      height = e.getBoundingClientRect().height;
      this.planService.updateCSSHeight(category, elementName, height);
      this.planService.updateCSSWidth(category, elementName, width);
      if (category) {
        this.cssData[category][elementName].width = width;
        this.cssData[category][elementName].height = height;
      } else {
        this.cssData[elementName].width = width;
        this.cssData[elementName].height = height;
      }
    }
    if (percentage && percentage > 0) {
      const newWidth = width * percentage / 100 * 2;
      const newHeight = height * percentage / 100 * 2;
      e.style.width = `${newWidth}px`;
      e.style.height = `${newHeight}px`;
    }
  }

  private positionElement(css: any, e: any): void {
    try {
      e.style.left = css.left;
      e.style.top = css.top;
    } catch (error) {
      console.log('Error.  Failed to find year data element to position.');
    }
  }
}
