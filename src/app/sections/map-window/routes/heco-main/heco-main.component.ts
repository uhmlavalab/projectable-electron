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

  private mapWidth: number;
  private lineWidth: number;
  private pieWidth: number;
  private lavaLogoWidth: number;
  private lavaLogoHeight: number;
  private hecoLogoWidth: number;
  private hecoLogoHeight: number;
  private yearDataHeight: number;
  private yearDataWidth: number;
  private lavaPercent: number;
  private yearDataPercent: number;
  private hecoPercent: number;
  private mapPercent: number;
  private linePercent: number;
  private piePercent: number;

  constructor(private planService: PlanService, private windowService: WindowService) {
    this.positionData = {};
    this.positionData.line = {};
    this.positionData.pie = {};
    this.positionData.map = {};
    this.positionData.lava = {};
    this.positionData.displayData = {};
    this.positionData.heco = {};
    this.mapWidth = 0;
    this.lineWidth = 0;
    this.pieWidth = 0;
    this.lavaLogoWidth = 0;
    this.lavaLogoHeight = 0;
    this.hecoLogoWidth = 0;
    this.hecoLogoHeight = 0;
    this.yearDataWidth = 0;
    this.yearDataHeight = 0;
  }

  ngAfterViewInit() {

    this.windowService.windowMessageSubject.subscribe(msg => {
      this.planService.handleMessage(msg);
    });

    this.planService.resizeSubject.subscribe(data => {
      if (data) {
        if (data.id === 'resize lava') {
          this.resizeLavaLogo(this.lavaLogo.nativeElement, data.percent);
        } else if (data.id === 'resize heco') {
          this.resizeHecoLogo(this.hecoLogo.nativeElement, data.percent);
        } else if (data.id === 'resize data') {
          this.resizeDataElement(this.yearData.nativeElement, data.percent);
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

    this.planService.cssSubject.subscribe(cssData => {
      if (cssData) {
        if (!this.windowService.isMain()) {
          this.positionElement(cssData.map, this.mapElement.nativeElement);
          this.positionElement(cssData.charts.line, this.lineChart.nativeElement);
          this.positionElement(cssData.charts.pie, this.pieChart.nativeElement);
          this.positionElement(cssData.data, this.yearData.nativeElement);
          this.positionElement(cssData.logos.lava, this.lavaLogo.nativeElement);
          this.positionElement(cssData.logos.heco, this.hecoLogo.nativeElement);
          setTimeout(()=> {
            this.resizeDataElement(this.yearData.nativeElement, cssData.data.percent);
            this.resizeLavaLogo(this.lavaLogo.nativeElement, cssData.logos.lava.percent);
            this.resizeHecoLogo(this.hecoLogo.nativeElement, cssData.logos.heco.percent);
          }, 500);

        }
      }
    });
  }
  ngOnDestroy() {
    this.messageSub.unsubscribe();
  }

  resizeLavaLogo(e: any, percentage: any) {
    if (percentage && percentage > 0) {
      if (this.lavaLogoWidth === 0) {
        this.lavaLogoWidth = e.getBoundingClientRect().width;
        this.lavaLogoHeight = e.getBoundingClientRect().height;
      }
      const newWidth = this.lavaLogoWidth * percentage / 100 * 2;
      const newHeight = this.lavaLogoHeight * percentage / 100 * 2;

      console.log(percentage, this.lavaLogoWidth, this.lavaLogoHeight, newWidth, newHeight);
      e.style.width = `${newWidth}px`;
      e.style.height = `${newHeight}px`;
    }
  }
  resizeHecoLogo(e: any, percentage: any) {
    if (percentage && percentage > 0) {
      if (this.hecoLogoWidth === 0) {
        this.hecoLogoWidth = e.getBoundingClientRect().width;
        this.hecoLogoHeight = e.getBoundingClientRect().height;
      }
      const newWidth = this.hecoLogoWidth * percentage / 100 * 2;
      const newHeight = this.hecoLogoHeight * percentage / 100 * 2;
      e.style.width = `${newWidth}px`;
      e.style.height = `${newHeight}px`;
    }
  }
  resizeDataElement(e: any, percentage: any) {
    if (percentage && percentage > 0) {
      if (this.yearDataWidth === 0) {
        this.yearDataWidth = e.getBoundingClientRect().width;
        this.yearDataHeight = e.getBoundingClientRect().height;
      }
      const newWidth = this.yearDataWidth * percentage / 100 * 2;
      const newHeight = this.yearDataHeight * percentage / 100 * 2;
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
