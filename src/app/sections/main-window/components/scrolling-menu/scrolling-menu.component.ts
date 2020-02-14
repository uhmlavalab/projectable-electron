import { Component, AfterViewInit, ElementRef, ViewChildren, QueryList, ViewChild, Input, HostListener } from '@angular/core'; import { PlanService } from '@app/services/plan.service';
import { Plan } from '@app/interfaces';
import { interval, Subject } from 'rxjs';
import { UiServiceService } from '@app/services/ui-service.service';

@Component({
  selector: 'app-scrolling-menu',
  templateUrl: './scrolling-menu.component.html',
  styleUrls: ['./scrolling-menu.component.css']
})
/** Scrolling Menu is a touch enabled component that displays options in a curved format.  If there
 * are more options than are currently shown on the screen, the options can be scrolled endlessly.
 * You can select the direction of the curve, either right or left.
 */
export class ScrollingMenuComponent implements AfterViewInit {
  @Input() type: string;
  @Input() largeFontSize: string;
  @ViewChildren('menuOption', { read: ElementRef }) menuOptions: QueryList<ElementRef>;
  @ViewChild('container', { static: false }) container: ElementRef;
  @ViewChild('touchOverlay', { static: false }) overlay: ElementRef;
  @ViewChild('centerBox', { static: false }) centerBox: ElementRef;

  private options: any[]; // Array holding all menu options.
  private numberVisible: number; // How many options are visible at one time on the screen.  The rest are hidden.
  private dragging: boolean; // True if elements are being dragged.  False if not.

  private optionsData: any[];

  private positionHistory: any[];
  private runningTotal: number;

  private speed: number;
  private speedDecayRate: number;
  private speedInterval: any;
  private repeatRate: number;
  private intervalRunning: boolean; // Sentinal that detects if there is an interval associated with this menu.  Prevents losing track of any intervals.
  private center: number; // Holds the value of the center of the visible menu div.

  private dividedHeight: number;

  private selectedOption: any;
  private selectedValue: any;

  private touchId: number;


  constructor(private el: ElementRef, private planService: PlanService, private uiService: UiServiceService) {
    this.optionsData = [];
    this.numberVisible = 10;
    this.speedInterval = -1;
    this.intervalRunning = false;
    this.options = [];
    this.dragging = false;
    this.positionHistory = [];
    this.runningTotal = 0;
    this.speed = 0;
    this.speedDecayRate = 0.90;
    this.repeatRate = 33;
    this.selectedOption = null;
    this.dividedHeight = 0;
    this.selectedValue = '0';
  }

  ngAfterViewInit() {
    this.centerBox.nativeElement.style.fontSize = this.largeFontSize;
    // The plan service will publish the data that goes into the menu.  the type passed by the
    // plan service subject must match the type of this menu to populate data.
    this.planService.scrollingMenuSubject.subscribe(val => {
      if (val) {
        if (val.type === this.type) {
          this.options = val.data;
          this.selectedValue = val.data[0];
          // Wait 100 ms for the ngfor to update the dom.
          setTimeout(() => {
            this.center = this.findCenter();  // Set the center of the visible menu window.
            this.setOptionsData(this.options); // Create the menu options objects.
            this.positionOptions(); // Set the top position for each element in the menu.
            this.selectedValue = val.data[0]; // Always initialize the initial selected option to the first in the list.
            this.selectedOption = this.optionsData[0];
            /* If there are overflowing elements, move half of them from the bottom of the list to the top.  They are offscreen
              but this allows for a smoother animation */
            for (let i = 0; i < Math.floor((this.optionsData.length - this.numberVisible) / 2); i++) {
                this.switchOptions(1);
            }
            // Make sure the selected element is in the center of the menu.
            this.adjustToCenter(val.data[0]);
            this.centerSelectedValue();
          }, 100);
        }
      }
    });

    this.planService.planSubject.subscribe(plan => {
      if (plan) {
        this.planService.getScrollingMenuData(this.type);
      }
    });
    this.overlay.nativeElement.style.top = '0';

    /* EVENT LISTENERS FOR TOUCH AND MOUSE */
    this.overlay.nativeElement.addEventListener('mousedown', () => this.startDrag(event));
    this.overlay.nativeElement.addEventListener('mouseup', () => this.stopDragging());
    this.overlay.nativeElement.addEventListener('mouseleave', () => {
      if (this.dragging) {
        this.stopDragging();
      }
    });
    this.overlay.nativeElement.addEventListener('mousemove', event => {
      if (this.dragging) {
        this.drag(event);
      }
    });

    this.overlay.nativeElement.addEventListener('touchstart', event => {
      this.startDrag(event);
    }, { passive: false });
    this.overlay.nativeElement.addEventListener('touchend', () => {
      this.stopDragging();
    }, { passive: false });
    this.overlay.nativeElement.addEventListener('touchmove', event => {
      if (this.dragging) {
        this.drag(event);
      }
    }, { passive: false });

  }

  /**  This function creates an array of objects that hold the data for each of the
   * menu options in the menu.
   * @param options The array holding the list of menu option values.
  */
  private setOptionsData(options): void {
    // Divide the height of the size of the parent container by the number of visible elements to get hight of each menu option.
    this.dividedHeight = this.overlay.nativeElement.getBoundingClientRect().height / this.numberVisible;
    // If there are less options than the number of visible, you must duplicate the elements until it fills the area plus extra.
      this.menuOptions.forEach((option, index) => {
        this.optionsData.push(
          {
            value: options[index], // Option Value
            element: option.nativeElement, // The HTML element for the option
            top: this.dividedHeight * this.optionsData.length, // The CSS top value of this element
            left: 0, // Css left value
            opacity: 1, // CSS opacity value
            fontSize: 999, // Font size of the particular element
            position: index // What position is it in the menu (changes when options are moved around in the menu as its scrolled.)
          }
        );
      });
  }


  /** Calculates the space needed for each element based on the number of elements and the
   * size of the container.  Then positions the elements accordingly.
   * @param center The center position of the element
   */
  private positionOptions(): void {
    this.optionsData.forEach(e => {
      e.element.style.top = `${e.top}px`;
    });
  }

  private updateSelectedOption(): void {
    const centerIndex = this.getCenterIndex();
    if (centerIndex >= 0 && (this.optionsData[centerIndex].value !== this.selectedValue) ) {
      this.selectedOption = this.optionsData[centerIndex];
      this.planService.handleMenuChange(this.type, this.selectedOption.value);
      this.selectedValue = this.selectedOption.value;
    }
  }

  private findCenter(): number {
    return this.centerBox.nativeElement.getBoundingClientRect().height / 2 +
      this.centerBox.nativeElement.getBoundingClientRect().top - this.container.nativeElement.getBoundingClientRect().top;
  }


  private adjustToCenter(value: any): boolean {
    let firstIndex = -1;
    this.optionsData.forEach((item, index) => {
      if (item.value === value && firstIndex === -1) {
        firstIndex = index;
      }
    });
    if (firstIndex === -1) {
      return false;
    } else {
      const centerIndex = this.getCenterIndex();
      if (centerIndex > 0) {
        const difference = firstIndex - centerIndex;
        if (difference > 0) {
          for (let i = difference + 1; i > 0; i--) {
            this.switchOptions(-1);
            this.moveEachOption(-this.dividedHeight);
          }
        } else if (difference < 0) {
          for (let i = 0; i < Math.abs(difference); i++) {
            this.switchOptions(1);
            this.moveEachOption(this.dividedHeight);
          }
        }
      } else {
        const currentTop = this.optionsData[Math.floor(this.optionsData.length / 2)].top;
        this.moveEachOption(this.center - currentTop - this.dividedHeight / 2);
        for (let i = 0; i < Math.floor(this.options.length / 2); i++) {
          this.switchOptions(1);
          this.moveEachOption(this.dividedHeight);
        }
      }
      this.positionOptions();
      }
    return true;
  }

  private centerSelectedValue(): void {
    
    const distance = this.selectedOption.top + this.dividedHeight / 2 - this.center + 5;
    this.moveEachOption(-distance);
    this.positionOptions();
  }

  private getCenterIndex(): number {
    let val = -1;
    this.optionsData.forEach((e, index) => {
      if (this.isCenter(e)) {
        val = index;
      }
    });
    return val;
  }

  isCenter(e): boolean {
    if (this.center > e.top && this.center < e.top + this.dividedHeight) {
      return true;
    } else {
      return false;
    }
  }

  private startDrag(event): void {
    if (this.intervalRunning) {
      clearInterval(this.speedInterval);
      this.intervalRunning = false;
    } else {
      this.setTouchId(event.touches);
      this.dragging = true;
    }
  }

  private stopDragging(): void {
    this.dragging = false;
    if (Math.abs(this.speed) > 1) {
      if (!this.intervalRunning) {
        this.intervalRunning = true;
        this.speedInterval = setInterval(() => {
          this.decaySpeed();
        }, this.repeatRate);
      }
    } else {
      this.positionHistory = [];
      this.speed = 0;
      this.touchId = -1;
      this.updateSelectedOption();
      this.centerSelectedValue();
    }
  }

  private setTouchId(touchlist): void {
    if (this.touchId === -1 && touchlist) {
      Object.values(touchlist).forEach((touch: Touch) => {
        if (touch.target === this.overlay.nativeElement) {
          this.touchId = touch.identifier;
        }
      });
    }
  }

  private drag(event): number {
    try {
      // Capture Y position of mouse or touch
      let mouseY = event.screenY;
      if (mouseY === undefined) {
        if (this.touchId !== undefined) {
          console.log(event.touches);
          mouseY = event.touches[this.touchId].screenY;
        }
      }
      if (mouseY) {
        this.positionHistory.push({ pos: mouseY, time: new Date().getTime() });
        if (this.positionHistory.length > 3) {
          const sum = this.getSum();
          this.moveEachOption(Math.round(sum));
          this.positionOptions();
          this.getSpeed();
          this.positionHistory = [];
          this.runningTotal = this.checkRunningTotal(sum);
          this.updateSelectedOption();
        }
      }

    } catch (error) {
      console.log(error);
      console.log('Error Dragging Menu object');
    } finally {
      return 0;
    }
  }

  private checkRunningTotal(sum: number): number {
    const total = sum + this.runningTotal;
    if (Math.abs(total) > this.dividedHeight) {
      const sign = Math.sign(total);
      this.switchOptions(sign);
      const newTotal = sign * (Math.abs(total) - this.dividedHeight);
      return newTotal;
    } else {
      return total;
    }
  }

  private moveEachOption(distance: number): void {
    this.optionsData.forEach(e => {
      e.top = e.top + distance;
    });
  }


  private switchOptions(sign: number): void {

    let tempPosition = 0; // Stores the top value for either the first or last element.
    let tempElement = null;

    if (sign > 0) {
      this.optionsData.forEach(el => {
        el.position = (el.position + 1) % (this.optionsData.length);
        if (el.position === 1) {
          tempPosition = el.top;
        } else if (el.position === 0) {
          tempElement = el;
        }
      });
      tempElement.top = tempPosition - this.dividedHeight;
    } else if (sign < 0) {
      this.optionsData.forEach(el => {
        if (el.position === 0) {
          el.position = this.optionsData.length - 1;
          tempElement = el;
        } else {
          if (el.position === this.optionsData.length - 1) {
            tempPosition = el.top;
          }
          el.position--;
        }
      });
      tempElement.top = tempPosition + this.dividedHeight;
    } else {
      // Do Nothing
    }
    tempElement.element.style.top = `${top}px`;
  }

  private getSum(): number {
    let sum = 0;
    this.positionHistory.forEach((point, index) => {
      if (index > 0) {
        sum += point.pos - this.positionHistory[index - 1].pos;
      }
    });
    return sum;
  }

  private getSpeed(): void {
    const sum = this.getSum();
    const speed = sum / (this.positionHistory[this.positionHistory.length - 1].time - this.positionHistory[0].time);
    this.speed = Math.floor(speed * this.repeatRate);
  }

  private decaySpeed(): void {
    if (Math.abs(this.speed) < 3 || this.speed === 0) {
      this.intervalRunning = false;
      clearInterval(this.speedInterval);
      this.positionHistory = [];
      this.speed = 0;
      this.speedInterval = -1;
      this.updateSelectedOption();
      this.centerSelectedValue();
    } else {
      const sign = Math.sign(this.speed);
      this.speed = Math.floor(Math.abs(this.speed * this.speedDecayRate)) * sign;
      this.moveEachOption(this.speed);
      this.positionOptions();
      this.runningTotal = this.checkRunningTotal(this.speed);
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.center = this.findCenter();
  }
}
