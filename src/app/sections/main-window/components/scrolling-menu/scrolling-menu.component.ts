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
  @Input() type;
  @Input() curve;
  @ViewChildren('menuOption', { read: ElementRef }) menuOptions: QueryList<ElementRef>;
  @ViewChild('container', { static: false }) container: ElementRef;
  @ViewChild('touchOverlay', { static: false }) overlay: ElementRef;
  @ViewChild('centerBox', { static: false }) centerBox: ElementRef;

  private options: any[]; // Array holding all menu options.
  private numberVisible: number; // How many options are visible at one time on the screen.  The rest are hidden.
  private curveLeft: boolean;
  private dragging: boolean; // True if elements are being dragged.  False if not.

  private optionsData: any[];

  private positionHistory: any[];
  private runningTotal: number;

  private speed: number;
  private speedDecayRate: number;
  private speedInterval: any;
  private repeatRate: number;
  private intervalRunning: boolean;
  private center: number;

  private dividedHeight: number;

  private selectedOption: any;
  private selectedValue: any;

  private touchId: number;


  constructor(private el: ElementRef, private planService: PlanService, private uiService: UiServiceService) {
    this.optionsData = [];
    this.curveLeft = false;
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
    this.planService.scrollingMenuSubject.subscribe(val => {
      if (val) {
        if (val.type === this.type) {
          this.options = val.data;
          this.selectedValue = val.data[0];
          setTimeout(() => {
            this.center = this.findCenter();
            this.setOptionsData(this.options);
            this.positionOptions();
            this.selectedOption = val.data[0];
            for (let i = 0; i < Math.floor((this.optionsData.length - this.numberVisible) / 2); i++) {
                this.switchOptions(1);
            }
            this.adjustToCenter(val.data[0]);
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

    this.overlay.nativeElement.addEventListener('mousedown', () => this.startDrag(event));
    this.overlay.nativeElement.addEventListener('mouseup', () => this.stopDragging());
    this.overlay.nativeElement.addEventListener('mouseleave', () => {
      if (this.dragging) {
        this.stopDragging();
      }
    });
    this.overlay.nativeElement.addEventListener('mousemove', event => {
      if (this.dragging) {
        this.drag(event, this.container);
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
        this.drag(event, this.container);
      }
    }, { passive: false });

  }

  private setOptionsData(options): void {
    this.dividedHeight = this.overlay.nativeElement.getBoundingClientRect().height / this.numberVisible;
    this.menuOptions.forEach((option, index) => {
      this.optionsData.push(
        {
          value: options[index],
          element: option.nativeElement,
          top: this.dividedHeight * index,
          left: 0,
          opacity: 1,
          fontSize: 999,
          position: index
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
    if (centerIndex > 0 && (this.optionsData[centerIndex].value !== this.selectedOption) ) {
      this.selectedOption = this.optionsData[centerIndex];
      this.uiService.handleMenuChange(this.type, this.selectedOption.value);
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
      if (item.value === value) {
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
    }
  }

  private setTouchId(touchlist): void {
    if (this.touchId === -1) {
      Object.values(touchlist).forEach((touch: Touch) => {
        if (touch.target === this.overlay.nativeElement) {
          this.touchId = touch.identifier;
        }
      });
    }
  }

  private drag(event, e): number {
    try {
      // Capture Y position of mouse or touch
      let mouseY = event.screenY;
      if (mouseY === undefined) {
        mouseY = event.touches[this.touchId].screenY;
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
    } else {
      const sign = Math.sign(this.speed);
      this.speed = Math.floor(Math.abs(this.speed * this.speedDecayRate)) * sign;
      this.moveEachOption(this.speed);
      this.positionOptions();
      this.runningTotal = this.checkRunningTotal(this.speed);
    }
  }

  private advanceByOne

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.center = this.findCenter();
  }
}
