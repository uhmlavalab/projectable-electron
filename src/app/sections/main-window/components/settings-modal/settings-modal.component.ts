import { Component, ViewChild, AfterViewInit, ElementRef } from '@angular/core';
import { PlanService } from '@app/services/plan.service';
import { WindowService } from '@app/modules/window';

@Component({
  selector: 'app-settings-modal',
  templateUrl: './settings-modal.component.html',
  styleUrls: ['./settings-modal.component.css']
})
/** This is a modal that pops up when the user clicks on the settings icon.  It allows the user to position elements
 * on the map from the touch interface and save them to a file.
 */
export class SettingsModalComponent implements AfterViewInit {

  @ViewChild('mapMover', { static: false }) mapElement;     // The map component
  @ViewChild('pieMover', { static: false }) pieElement;     // The pie chart component.
  @ViewChild('lineMover', { static: false }) lineElement;   // The line chart component.
  @ViewChild('displayingDataMover', { static: false }) displayDataElement;   // The line chart component.
  @ViewChild('lavaLogoMover', { static: false }) lavaLogoElement;   // The line chart component.
  @ViewChild('hecoLogoMover', { static: false }) hecoLogoElement;   // The line chart component.
  @ViewChild('extraLine', { static: false }) extraLine;   // The line chart component.
  @ViewChild('extraMap', { static: false }) extraMap;   // The line chart component.
  @ViewChild('extraPie', { static: false }) extraPie;   // The line chart component.
  @ViewChild('extraData', { static: false }) extraData;   // The line chart component.
  @ViewChild('extraHeco', { static: false }) extraHeco;   // The line chart component.
  @ViewChild('extraLava', { static: false }) extraLava;   // The line chart component.

  private dragging: boolean;
  private touchId: number;
  private isSet: boolean;
  private exMap: boolean;
  private exLine: boolean;
  private exPie: boolean;
  private exHeco: boolean;
  private exData: boolean;
  private exLava: boolean;
  private z: number;
  private elements: { tag: string; category: string; e: ElementRef; extraE: ElementRef; top: number; left: number }[];
  private cssData: any;
  private windowData: any;
  private positionHistory: { x: number, y: number }[];

  constructor(private planService: PlanService, private windowService: WindowService) {
    this.dragging = false;
    this.touchId = -1;
    this.isSet = false;
    this.exMap = false;
    this.exLine = false;
    this.exPie = false;
    this.exLava = false;
    this.exHeco = false;
    this.exData = false;
    this.z = 10000;     // This holds the initial z index of the mover.
    this.positionHistory = [];
  }

  ngAfterViewInit() {

    this.planService.getOtherWindowData();

    this.elements = [
      { tag: 'map', category: null, e: this.mapElement, extraE: this.extraMap, top: 0, left: 0 },
      { tag: 'pie', category: 'charts', e: this.pieElement, extraE: this.extraPie, top: 0, left: 0 },
      { tag: 'line', category: 'charts', e: this.lineElement, extraE: this.extraLine, top: 0, left: 0 },
      { tag: 'data', category: null, e: this.displayDataElement, extraE: this.extraData, top: 0, left: 0 },
      { tag: 'heco', category: 'logos', e: this.hecoLogoElement, extraE: this.extraHeco, top: 0, left: 0 },
      { tag: 'lava', category: 'logos', e: this.lavaLogoElement, extraE: this.extraLava, top: 0, left: 0 }
    ];

    this.planService.cssSubject.subscribe(data => {
      if (data) {
        this.cssData = data;
        if (this.windowData) {
          this.positionAll();
        }
      }
    });

    this.planService.windowDataSubject.subscribe(data => {
      if (data) {
        this.windowData = data;
        if (this.cssData) {
          this.positionAll();
        }
      }
    });

    this.elements.forEach(e => {
      e.e.nativeElement.addEventListener('touchstart', event => {
        this.startDrag(event.touches, e.e);
      }, { passive: false });
      e.e.nativeElement.addEventListener('touchend', () => {
        this.stopDrag();
      }, { passive: false });
      e.e.nativeElement.addEventListener('touchmove', event => {
        if (this.dragging) {
          this.drag(event, e.e, e.tag);
        }
      }, { passive: false });
      e.extraE.nativeElement.addEventListener('touchstart', () => {
        if (this.dragging) {
          this.stopDrag();
        }
      }, { passive: false });
    });
  }

  private positionAll(): void {
    if (this.windowService.isMain() && !this.isSet && this.cssData && this.windowData) {
      this.elements.forEach(e => {
        this.positionElement(this.cssData, e);
      });
      this.isSet = true;
    }
  }

  /** Begins the dragging process.
   * @param touches the touchlist provided by the browser.
   * @param el the element that is being positioned.
   */
  private startDrag(touches, el): void {
    this.positionHistory = [];
    this.dragging = true;
    this.setTouchId(touches, el); // Set the id of the finger that is dragging.
    el.nativeElement.style.zIndex = this.z;
    this.z++;
  }

  /** Drags an element on the screen and passes the position values to the other window.
   * @param event the touch/mouse event.
   * @param el the element that is beign dragged.
   * @param identifier a string that will identify which element is being moved when the map is messaged.
   */
  private drag(event, el, identifier): number {
    try {
      let mouseY = null;  // Y position of the touch/mouse
      let mouseX = null;  // X position of the touch/mouse
      if (this.touchId >= 0) {
        mouseY = event.touches[this.touchId].screenY;
        mouseX = event.touches[this.touchId].screenX;
      }
      this.positionHistory.push({ x: mouseX, y: mouseY });
      if (mouseY && mouseX) {
        if (this.positionHistory.length > 4) {
          const x = this.positionHistory[this.positionHistory.length - 1].x - this.positionHistory[0].x;
          const y = this.positionHistory[this.positionHistory.length - 1].y - this.positionHistory[0].y;
          const element = this.elements.find(e => e.tag === identifier);
          element.top = element.top + y;
          element.left = element.left + x;
          el.nativeElement.style.top = `${element.top}px`;
          el.nativeElement.style.left = `${element.left}px`;
          this.planService.positionMapElements(identifier, element.left, element.top); // Notify plan service of changes.
          this.positionHistory = [];
        }
      }
    } catch (error) {
      console.log(error);
      console.log('Error Dragging Menu object');
    } finally {
      return 0;
    }
  }

  private stopDrag(): void {
    this.dragging = false;
    this.touchId = -1;
  }

  private setTouchId(touchlist, el): void {
    if (this.touchId === -1 && touchlist) {
      Object.values(touchlist).forEach((touch: Touch) => {
        if (touch.target === el.nativeElement) {
          this.touchId = touch.identifier;
        }
      });
    }
  }

  // tslint:disable-next-line: max-line-length
  private positionElement(css: any, e: { tag: string; category: string; e: ElementRef; extraE: ElementRef, top: number, left: number }): void {
    try {
      // Select map element from viewchild
      if (e.category) {
        const percentage = css[e.category][e.tag].percent / 100 * 2;
        const widthPercent = css[e.category][e.tag].width * percentage / this.windowData.width * 100;
        const heightPercent = css[e.category][e.tag].height * percentage / this.windowData.height * 100;
        const width = widthPercent < 20 ? `200px` : `${widthPercent}%`;
        const height = widthPercent < 20 ? `200px` : `${heightPercent}%`;
        e.e.nativeElement.style.width = width;
        e.e.nativeElement.style.height = height;
        e.e.nativeElement.style.left = css[e.category][e.tag].left;
        e.e.nativeElement.style.top = css[e.category][e.tag].top;
        e.top = parseInt(css[e.category][e.tag].top.split('px')[0], 10);
        e.left = parseInt(css[e.category][e.tag].left.split('px')[0], 10);

      } else {
        const percentage = css[e.tag].percent / 100 * 2;
        const widthPercent = css[e.tag].width * percentage / this.windowData.width * 100;
        const heightPercent = css[e.tag].height * percentage / this.windowData.height * 100;
        const width = widthPercent < 10 ? `200px` : `${widthPercent}%`;
        const height = widthPercent < 20 ? `200px` : `${heightPercent}%`;
        e.e.nativeElement.style.width = width;
        e.e.nativeElement.style.height = height;
        e.e.nativeElement.style.left = css[e.tag].left;
        e.e.nativeElement.style.top = css[e.tag].top;
        e.top = parseInt(css[e.tag].top.split('px')[0], 10);
        e.left = parseInt(css[e.tag].left.split('px')[0], 10);
      }

    } catch (error) {
      console.log('Failed To locate Element to position');
    }
  }

  /** Expands the settings area to add resizing options */
  private expandMapOptions(): void {
    this.exMap = !this.exMap;
    const displayVal = this.exMap ? 'block' : 'none';
    this.extraMap.nativeElement.style.display = displayVal;
  }
  /** Expands the settings area to add resizing options */
  private expandPieOptions(): void {
    this.exPie = !this.exPie;
    const displayVal = this.exPie ? 'block' : 'none';
    this.extraPie.nativeElement.style.display = displayVal;
  }
  /** Expands the settings area to add resizing options */
  private expandLineOptions(): void {
    this.exLine = !this.exLine;
    const displayVal = this.exLine ? 'block' : 'none';
    this.extraLine.nativeElement.style.display = displayVal;
  }
  /** Expands the settings area to add resizing options */
  private expandLavaOptions(): void {
    this.exLava = !this.exLava;
    const displayVal = this.exLava ? 'block' : 'none';
    this.extraLava.nativeElement.style.display = displayVal;
  }
  /** Expands the settings area to add resizing options */
  private expandHecoOptions(): void {
    this.exHeco = !this.exHeco;
    const displayVal = this.exHeco ? 'block' : 'none';
    this.extraHeco.nativeElement.style.display = displayVal;
  }
  /** Expands the settings area to add resizing options */
  private expandDataOptions(): void {
    this.exData = !this.exData;
    const displayVal = this.exData ? 'block' : 'none';
    this.extraData.nativeElement.style.display = displayVal;
  }

  private handleClick(save: boolean): void {
    this.planService.closePositionModal(save);
  }
}
