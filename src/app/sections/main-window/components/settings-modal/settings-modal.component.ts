import { Component, ViewChild, AfterViewInit } from '@angular/core';
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
  }

  ngAfterViewInit() {
    const data = this.windowService.getCssFileData();

    if (this.windowService.isMain() && !this.isSet && data.css) {
      this.positionMap(data.css.map);
      this.positionLineChart(data.css.charts.line);
      this.positionPieChart(data.css.charts.pie);
      this.isSet = true;
    }

    this.mapElement.nativeElement.addEventListener('touchstart', event => {
      this.startDrag(event.touches, this.mapElement);
    }, { passive: false });
    this.mapElement.nativeElement.addEventListener('touchend', () => {
      this.stopDrag();
    }, { passive: false });
    this.mapElement.nativeElement.addEventListener('touchmove', event => {
      if (this.dragging) {
        this.drag(event, this.mapElement, 'map');
      }
    }, { passive: false });

    this.pieElement.nativeElement.addEventListener('touchstart', event => {
      this.startDrag(event.touches, this.pieElement);
    }, { passive: false });
    this.pieElement.nativeElement.addEventListener('touchend', () => {
      this.stopDrag();
    }, { passive: false });
    this.pieElement.nativeElement.addEventListener('touchmove', event => {
      if (this.dragging) {
        this.drag(event, this.pieElement, 'pie');
      }
    }, { passive: false });

    this.lineElement.nativeElement.addEventListener('touchstart', event => {
      this.startDrag(event.touches, this.lineElement);
    }, { passive: false });
    this.lineElement.nativeElement.addEventListener('touchend', () => {
      this.stopDrag();
    }, { passive: false });
    this.lineElement.nativeElement.addEventListener('touchmove', event => {
      if (this.dragging) {
        this.drag(event, this.lineElement, 'line');
      }
    }, { passive: false });

    this.lavaLogoElement.nativeElement.addEventListener('touchstart', event => {
      this.startDrag(event.touches, this.lavaLogoElement);
    }, { passive: false });
    this.lavaLogoElement.nativeElement.addEventListener('touchend', () => {
      this.stopDrag();
    }, { passive: false });
    this.lavaLogoElement.nativeElement.addEventListener('touchmove', event => {
      if (this.dragging) {
        this.drag(event, this.lavaLogoElement, 'lava');
      }
    }, { passive: false });

    this.displayDataElement.nativeElement.addEventListener('touchstart', event => {
      this.startDrag(event.touches, this.displayDataElement);
    }, { passive: false });
    this.displayDataElement.nativeElement.addEventListener('touchend', () => {
      this.stopDrag();
    }, { passive: false });
    this.displayDataElement.nativeElement.addEventListener('touchmove', event => {
      if (this.dragging) {
        this.drag(event, this.displayDataElement, 'displayData');
      }
    }, { passive: false });

    this.hecoLogoElement.nativeElement.addEventListener('touchstart', event => {
      this.startDrag(event.touches, this.hecoLogoElement);
    }, { passive: false });
    this.hecoLogoElement.nativeElement.addEventListener('touchend', () => {
      this.stopDrag();
    }, { passive: false });
    this.hecoLogoElement.nativeElement.addEventListener('touchmove', event => {
      if (this.dragging) {
        this.drag(event, this.hecoLogoElement, 'heco');
      }
    }, { passive: false });

    this.extraMap.nativeElement.addEventListener('touchstart', () => {
      if (this.dragging) {
        this.stopDrag();
      }
    }, { passive: false });
    this.extraLine.nativeElement.addEventListener('touchstart', () => {
      if (this.dragging) {
        this.stopDrag();
      }
    }, { passive: false });
    this.extraPie.nativeElement.addEventListener('touchstart', () => {
      if (this.dragging) {
        this.stopDrag();
      }
    }, { passive: false });
    this.extraData.nativeElement.addEventListener('touchstart', () => {
      if (this.dragging) {
        this.stopDrag();
      }
    }, { passive: false });
    this.extraHeco.nativeElement.addEventListener('touchstart', () => {
      if (this.dragging) {
        this.stopDrag();
      }
    }, { passive: false });
    this.extraLava.nativeElement.addEventListener('touchstart', () => {
      if (this.dragging) {
        this.stopDrag();
      }
    }, { passive: false });
  }



  /** Begins the dragging process.
   * @param touches the touchlist provided by the browser.
   * @param el the element that is being positioned.
   */
  private startDrag(touches, el): void {
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
      if (mouseY && mouseX) {
        el.nativeElement.style.top = `${mouseY - 100}px`;
        el.nativeElement.style.left = `${mouseX - 100}px`;
      }
      this.planService.positionMapElements(identifier, mouseX, mouseY); // Notify plan service of changes.
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

  private positionMap(css: any): void {
    try {
      // Select map element from viewchild
      const e = this.mapElement.nativeElement;
      e.style.left = css.left;
      e.style.top = css.top;
    } catch (error) {
      console.log('Failed To locate Element to position');
    }
  }

  private positionLineChart(css: any): void {
    try {
      // Select map element from viewchild
      const e = this.lineElement.nativeElement;
      e.style.left = css.left;
      e.style.top = css.top;
    } catch (error) {
      console.log('Error.  Failed to find element to position.');
    }
  }

  private positionPieChart(css: any): void {
    try {
      // Select map element from viewchild
      const e = this.pieElement.nativeElement;
      e.style.left = css.left;
      e.style.top = css.top;
    } catch (error) {
      console.log('Error. Failed to find the element to position. ');
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
