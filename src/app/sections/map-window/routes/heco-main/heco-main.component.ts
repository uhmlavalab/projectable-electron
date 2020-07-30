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
/** This component is the main map display view.  IT contains maps, charts, and other data displayed by the projector. */
export class HecoMainComponent implements AfterViewInit, OnDestroy {

  @ViewChild('map', { static: false, read: ElementRef }) mapElement;      // The actual map and all paths
  @ViewChild('pieChart', { static: false, read: ElementRef }) pieChart;   // The custom Map component.
  @ViewChild('lineChart', { static: false, read: ElementRef }) lineChart; // The custom Map component.
  @ViewChild('yearData', { static: false, read: ElementRef }) yearData;   // Component that displays renewable %, year, scenario
  @ViewChild('hecoLogo', { static: false, read: ElementRef }) hecoLogo;   // The heco logo component
  @ViewChild('lavaLogo', { static: false, read: ElementRef }) lavaLogo;   // The lava logo component
  @ViewChild('loadingScreen', { static: false, read: ElementRef }) loadingScreen: ElementRef;

  private positionData: any;      // Object that contains the position data (height, width, percentage) for each object
  private messageSub = new Subscription();  // Stub that handles all messages coming from the main window.
  private cssData: any;           // Data used to position the elements in the proper layout.
  private elements: { e: ElementRef; tag: string, category: string }[];  //  Object that holds all elements for quick access.

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

        // // Set subscription to remove loading image
        // this.planService.mapImageLoaded.subscribe(val => {
        //   if (val) {
        //     this.loadingScreen.nativeElement.style.display = 'none';
        //   }
        // });

    // Some elements have nested objects, like charts.pie, or logos.lava, some like map do not.
    this.elements = [
      { e: this.mapElement, tag: 'map', category: 'map' },
      { e: this.pieChart, tag: 'pie', category: 'charts' },
      { e: this.lineChart, tag: 'line', category: 'charts' },
      { e: this.yearData, tag: 'data', category: 'data' },
      { e: this.hecoLogo, tag: 'heco', category: 'logos' },
      { e: this.lavaLogo, tag: 'lava', category: 'logos' }
    ];

    // Pass any messages received to the plan service.
    this.windowService.windowMessageSubject.subscribe(msg => {
      this.planService.handleMessage(msg);
    });

    /** These components are simple and can be resized here.  The charts and map are resized within their own component. */
    this.planService.resizeSubject.subscribe(data => {
      if (data) {
        if (data.id === 'resize lava') {
          this.resizeElement(this.lavaLogo.nativeElement, 'logos', 'lava', data.width, data.height, data.percent);
        } else if (data.id === 'resize heco') {
          this.resizeElement(this.hecoLogo.nativeElement, 'logos', 'heco', data.width, data.height, data.percent);
        } else if (data.id === 'resize data') {
          this.resizeElement(this.yearData.nativeElement, 'data', 'data', data.width, data.height, data.percent);
          this.adjustFontSize(this.yearData.nativeElement, data.percent);
        }
      }
    });

    /** When elements repositioned in the settings modal of the GUI, the data is sent here for updating. */
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

    // Called if the user made changes to the layout but decided not to save them
    this.planService.revertPositionsSubject.subscribe(val => {
      if (val) {
        if (!this.windowService.isMain()) {
          this.positionAll(this.cssData);
        }
      }
    });

    // Css data is loaded from a file and published
    this.planService.cssSubject.subscribe(cssData => {
      if (cssData) {
        this.cssData = cssData;
        if (!this.windowService.isMain()) {
          this.positionAll(cssData);
        }
      }
    });

    // Elements can be hidden or shown in the settings modal.
    this.planService.toggleElementSubject.subscribe(val => {
      if (val) {
        try {
          this.elements.find(e => e.tag === val.tag).e.nativeElement.style.display = val.show ? 'block' : 'none';
        } catch(e) {
         console.log(e);
        }
      }
    });

    // If the plan service requests width data, return it.
    this.planService.getWidthSubject.subscribe((val: boolean) => {
      if (val) {
        this.elements.forEach(e => {
          console.log(e);
          this.planService.updateCSSHeight(e.category, e.tag, e.e.nativeElement.getBoundingClientRect().height);
          this.planService.updateCSSWidth(e.category, e.tag, e.e.nativeElement.getBoundingClientRect().width);
        });
      }
    });
  }

  ngOnDestroy() {
    this.messageSub.unsubscribe();
  }

  /** positions all elements.  Loops through the elements array and moved all elements according to the data received.
   * @param cssData object containing the css data for positioning the elements.
   */
  positionAll(cssData) {
    this.elements.forEach(e => {
      // Set the path to the correct css values.
      const css = cssData[e.category][e.tag];
      this.positionElement(css, e.e.nativeElement);    // Each element data is passed to positionElement function
      e.e.nativeElement.style.display = css.visible ? 'block' : 'none';   // Toggle visibility of each element
    });

    // The timeout is necessary to ensure that all elements are properly positioned before attemting to resize them.
    setTimeout(() => {
      this.resizeElement(this.yearData.nativeElement, 'data', 'data', cssData.data.width, cssData.data.height, cssData.data.percent);
      // tslint:disable-next-line: max-line-length
      this.resizeElement(this.lavaLogo.nativeElement, 'logos', 'lava', cssData.logos.lava.width, cssData.logos.lava.height, cssData.logos.lava.percent);
      // tslint:disable-next-line: max-line-length
      this.resizeElement(this.hecoLogo.nativeElement, 'logos', 'heco', cssData.logos.heco.width, cssData.logos.heco.height, cssData.logos.heco.percent);
      this.adjustFontSize(this.yearData.nativeElement, cssData.data.percent);
    }, 500);
  }

  /** Resizes the HTML elements
   * @param e the element to resize
   * @param category part of the element path
   * @param elementName the name of the element to resize.
   * @param width the width of the element to resize
   * @param height the height of the element to resize.
   * @param percentage the percent change in the size of the element.
   */
  resizeElement(e: any, category: string, elementName: string, width: number, height: number, percentage: any) {
    // If the width or height are undefined, set them to 0 and continue
    if (!width || !height) {
      width = 0;
      height = 0;
    }

    // If the width or height were undefined, update the data here and in the plan service data table before resizing anything.
    if (width === 0 || height === 0) {
      width = e.getBoundingClientRect().width;
      height = e.getBoundingClientRect().height;
      this.planService.updateCSSHeight(category, elementName, height);
      this.planService.updateCSSWidth(category, elementName, width);
      console.log(this.cssData);
      const css_path = this.cssData[category][elementName];
      css_path.width = width;
      css_path.height = height;
    }

    // Resize the element if a valid percentage value was received.
    if (percentage && percentage > 0) {
      const newWidth = width * percentage / 100 * 2;
      const newHeight = height * percentage / 100 * 2;
      e.style.width = `${newWidth}px`;
      e.style.height = `${newHeight}px`;
    }
  }

  /** Position an element on the dom
   * @param css the data that holds left and top pixel values (int the form of '20px', ie. strings, not numbers)
   * @param e the element to position
   */
  private positionElement(css: any, e: any): void {
    try {
      e.style.left = css.left;
      e.style.top = css.top;
    } catch (error) {
      console.log('Error.  Failed to find year data element to position.');
    }
  }

  /** Adjusts font size based on slider percentage.  This is mainly inteted for the year-data-display component.  Changing
   * the width and height does very little so this will increase the size of the font.  It siply doubles the percentage and
   * uses that value an em size.
   * @param percentage the percent as defined in the css data file or manual resizing
   * @param e the element who will have the font size adjusted. (native element must be passed as argument)
   */
  private adjustFontSize(e: any, percentage: any): void {
      e.style.fontSize = `${percentage / 100 * 2}em`;
  }

  /** The application may have two different resolutions between screens.  Therefore, we send the width and height value as
   * percentages and convert it to pixel values.
   * @param percent the width or height in percentage
   * @param width true if the value is a width value, false if it is a height value.
    */
  private convertPercentToPixel(percent: number, width: boolean): number {
    return width ? percent / 100 * window.innerWidth : percent / 100 * window.innerHeight;
  }
}
