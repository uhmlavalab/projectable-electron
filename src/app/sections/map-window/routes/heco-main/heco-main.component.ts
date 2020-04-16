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
  private elements: { e: ElementRef; tag: string, category: string }[];

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
    this.elements = [
      { e: this.mapElement, tag: 'map', category: null },
      { e: this.pieChart, tag: 'pie', category: 'charts' },
      { e: this.lineChart, tag: 'line', category: 'charts' },
      { e: this.yearData, tag: 'data', category: null },
      { e: this.hecoLogo, tag: 'heco', category: 'logos' },
      { e: this.lavaLogo, tag: 'lava', category: 'logos' }
    ];
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
          // Data is percentage from left (x) and top (y) and must be converted to pixel values.
          const x = this.convertPercentToPixel(data.x, true);
          const y = this.convertPercentToPixel(data.y, false);
          const e = this.elements.find(element => element.tag === data.id);
          e.e.nativeElement.style.left = `${x}px`;
          e.e.nativeElement.style.top = `${y}px`;
          this.positionData[data.id] = { x: x, y: y };
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

    this.planService.toggleElementSubject.subscribe(val => {
      if (val) {
        this.elements.find(e => e.tag === val.tag).e.nativeElement.style.display = val.show ? 'block' : 'none';
      }
    });

    this.planService.getWidthSubject.subscribe((val: boolean) => {
      if (val) {
        this.elements.forEach(e => {
          this.planService.updateCSSHeight(e.category, e.tag, e.e.nativeElement.getBoundingClientRect().height);
          this.planService.updateCSSWidth(e.category, e.tag, e.e.nativeElement.e.getBoundingClientRect().width);
        });
      }
    });
  }
  ngOnDestroy() {
    this.messageSub.unsubscribe();
  }

  positionAll(cssData) {
    this.elements.forEach(e => {
      const css = e.category ? cssData[e.category][e.tag] : cssData[e.tag];
      this.positionElement(css, e.e.nativeElement);
      e.e.nativeElement.style.display = css.visible ? 'block' : 'none';
    });
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
      const css_path = category ? this.cssData[category][elementName] : this.cssData[elementName];
      css_path.width = width;
      css_path.height = height;
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

  private convertPercentToPixel(percent: number, width: boolean): number {
    return width ? percent / 100 * window.innerWidth : percent / 100 * window.innerHeight;
  }
}
