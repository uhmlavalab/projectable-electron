import { Component, AfterViewInit, ElementRef, ViewChildren, QueryList, ViewChild, Input, HostListener } from '@angular/core';
import { PlanService } from '@app/services/plan.service';

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
   // Sentinal that detects if there is an interval associated with this menu.  Prevents losing track of any intervals.
  private intervalRunning: boolean;
  private center: number; // Holds the value of the center of the visible menu div.
  private dividedHeight: number;
  private selectedOption: any;
  private selectedValue: any;
  private touchId: number;
  private scrolling: boolean;
  private setupComplete: boolean;
  private stopped: boolean;

  constructor(private el: ElementRef, private planService: PlanService) {
    this.optionsData = [];        // Array of objects that contain the data for each menu option
    this.numberVisible = 10;      // The number of elements that should be visible on the screen.  (alters spacing.)
    this.speedInterval = -1;      // Holds the interval id for the animation of the menu when it is slowing down.
    this.intervalRunning = false; // If there is an animation running, this will be true.
    this.options = [];            // Array of strings used to populate the html elements.
    this.dragging = false;        // True when dragging.
    this.positionHistory = [];    // Array holding the finger position and time that it was calculated.
    this.runningTotal = 0;        // Holds the total distance the finger has traveled.
    this.speed = 0;               // Holds the speed that the figner was moving.
    this.speedDecayRate = 0.90;   // Rate at which the speed will be decated when the menu is slowing down.
    this.repeatRate = 33;         // Interval rate
    this.selectedOption = null;   // The option that is currently in the center.
    this.dividedHeight = 0;       // The height of a single menu option.
    this.selectedValue = '0';     // String value of the selected option
    this.scrolling = true;        // True if the menu is scrolling.
    this.setupComplete = false;   // True once all data is ready.
    this.touchId = -1;            // Holds the id of the touch event.
    this.stopped = true;          // True when the menu is not being scrolled.  This determines if app should play the year sound or wait.
  }

  ngAfterViewInit() {
    this.centerBox.nativeElement.style.fontSize = this.largeFontSize;
    // The plan service will publish the data that goes into the menu.  the type passed by the
    // plan service subject must match the type of this menu to populate data.
    this.planService.scrollingMenuSubject.subscribe(value => {
      if (value) {
        value.forEach(val => {
          if (val.type === this.type) {
            this.options = val.data;
            if (this.options.length < this.numberVisible) {
              this.scrolling = false;
            }
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
              this.setupComplete = true;
            }, 500);
          }
        });
      }
    });

    //
    this.planService.yearSubject.subscribe(year => {
      if (year && this.setupComplete) {
        if (this.type === 'year' && (this.selectedOption.value !== year)) {
          this.findSelectedOption(year);
          this.autoRotateTo();
        }
      }
    });

    this.overlay.nativeElement.style.top = '0';

    /* EVENT LISTENERS FOR TOUCH AND MOUSE */
    this.overlay.nativeElement.addEventListener('mousedown', event => {
      if (this.scrolling) {
        this.startDrag(event);
      } else {
        this.changeActive(event);
      }
    });
    this.overlay.nativeElement.addEventListener('mouseup', event => {
      if (this.scrolling) {
        this.stopDragging();
      }
    });
    this.overlay.nativeElement.addEventListener('mouseleave', () => {
      if (this.scrolling && this.dragging) {
        this.stopDragging();
      }
    });
    this.overlay.nativeElement.addEventListener('mousemove', event => {
      if (this.scrolling && this.dragging) {
        this.drag(event);
      }
    });

    this.overlay.nativeElement.addEventListener('touchstart', event => {
      if (this.scrolling) {
        this.startDrag(event);
      } else {
        this.changeActive(event);
      }
    }, { passive: false });
    this.overlay.nativeElement.addEventListener('touchend', () => {
      if (this.scrolling) {
        this.stopDragging();
      }
    }, { passive: false });
    this.overlay.nativeElement.addEventListener('touchmove', event => {
      if (this.scrolling && this.dragging) {
        this.drag(event);
      }
    }, { passive: false });
  }

  private findSelectedOption(year: number) {
    this.optionsData.forEach(e => {
      if (e.value == year) {
        this.selectedOption = e;
      }
    });
  }

  /** Starts the drag process.
   * @param event the touch/mouse event.
   */
  private startDrag(event): void {
    this.stopped = false;
    if (this.intervalRunning) {               // Check to make sure no animations are running
      clearInterval(this.speedInterval);      // If there is an interval, clear it.
      this.intervalRunning = false;
    } else {
      this.setTouchId(event.touches);         // Set the touch id of the event.
      this.dragging = true;
    }
  }

  /** End the dragging process when a finger or mouse is lifted. */
  private stopDragging(): void {
    this.dragging = false;
    if (Math.abs(this.speed) > 1) {           // If the finger speed was more than 1 when lifted.  Animate.
      if (!this.intervalRunning) {
        this.intervalRunning = true;
        this.speedInterval = setInterval(() => {
          this.decaySpeed();
        }, this.repeatRate);
      }
    } else {                        // No animation necessary.  Stop scrolling and see what is in the center.
      this.stopped = true;
      this.positionHistory = [];
      this.speed = 0;
      this.touchId = -1;
      this.updateSelectedOption();
      this.centerSelectedValue();
    }
  }

  /** The method that handles the actual drag of the HTML elements.
   * @param event the touch/mouse event that is controlling the drag.
   */
  private drag(event): void {
    try {
      // Capture Y position of mouse or touch
      let mouseY = event.screenY;
      if (mouseY === undefined) {
        if (this.touchId !== undefined) {
          let touch = null;
          Object.values(event.touches).forEach((t: Touch) => {
            if (t.identifier === this.touchId) {
              touch = t;
            }
          });
          mouseY = touch.screenY;
        }
      }
      if (mouseY) {
        // Store position and time of touch for each update the browser does.  (time is used for speed)
        this.positionHistory.push({ pos: mouseY, time: new Date().getTime() });
        if (this.positionHistory.length > 2) {
          const sum = this.getSum(); // Sum adds together the last 3 positions for smoother movement.
          this.moveEachOption(Math.round(sum));  // Update element positions.
          this.positionOptions();    // Move the elemnts
          this.getSpeed();           // Always get the current finger speed in case the touch ends.
          // Alwyas clear all touch positions except for the last one.
          this.positionHistory = [this.positionHistory[this.positionHistory.length - 1]];
          /* Running total keeps track of the TOTAL distance moved so that when it is larger than the height of a
          menu option the bottom element is moved to the top or vice versa */
          this.runningTotal = this.checkRunningTotal(sum);
          this.updateSelectedOption(); // Check to see if there is a new center value.
        }
      }
    } catch (error) {
      console.log(error);
      console.log('Error Dragging Menu object');
    }
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
      let opacity = 1;
      if (index > 0 && !this.scrolling) {
        opacity = 0.4;
      } else if (index === 0 && !this.scrolling) {
        option.nativeElement.style.textDecoration = 'underline';
      }
      option.nativeElement.style.opacity = opacity;
      this.optionsData.push(
        {
          value: options[index], // Option Value
          element: option.nativeElement, // The HTML element for the option
          top: this.dividedHeight * this.optionsData.length, // The CSS top value of this element
          left: 0, // Css left value
          opacity: opacity, // CSS opacity value
          fontSize: 999, // Font size of the particular element
          position: index // What position is it in the menu (changes when options are moved around in the menu as its scrolled.)
        }
      );
    });
  }

  /** If the menu is static (ie. the scenarios) then change active is called on a touch event.  It will determine the new
   * value that is selected.
   * @param event the touch/mouse event.
   */
  private changeActive(event): void {
    this.touchId = -1;                  // Clear the current touch event.
    this.setTouchId(event.touches);     // Set the new touch event id.
    let mouseY = event.screenY;         // If it is a mouse event, mouseY will be set.
    if (mouseY === undefined) {         // If not, find the touch event and set it to mouseY.
      if (this.touchId !== undefined) {
        mouseY = event.touches[this.touchId].screenY;
      }
    }

    if (mouseY) {
      this.optionsData.forEach(e => {
        // Do a boundary check to determine which button was clicked.
        if (mouseY > e.element.getBoundingClientRect().top && mouseY < e.element.getBoundingClientRect().top + this.dividedHeight) {
          this.selectedOption = e;
          this.planService.handleMenuChange(this.type, this.selectedOption.value, false);
          e.opacity = 1;
          e.element.style.textDecoration = 'underline';
        } else {
          e.opacity = 0.6;
          e.element.style.textDecoration = 'none';
        }
        e.element.style.opacity = e.opacity;
      });
    }
  }

  /** We need to keep track of the center of the window.  The menu options are selected when they are moved to the center in the scrolling
   * menu.  If the menu is static, this function is used to place the menu options in the center of the visible window.
   * @return the center of the visible window in pixels.
   */
  private findCenter(): number {
    if (this.scrolling) {
      return this.centerBox.nativeElement.getBoundingClientRect().height / 2 +
        this.centerBox.nativeElement.getBoundingClientRect().top - this.container.nativeElement.getBoundingClientRect().top;
    } else {
      return this.container.nativeElement.getBoundingClientRect().height / 2;
    }
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

  /** Finds out which option is in the center of the visible window and updates the variables accordingly. */
  private updateSelectedOption(): void {
    const centerIndex = this.getCenterIndex();  // Gets the index of the array that is in the center of the window.
    // Make certain the index is valid and the value at this index is different than the current value.
    console.log(this.stopped);
    if ((centerIndex >= 0 && (this.optionsData[centerIndex].value !== this.selectedValue)) || this.stopped) {
      this.selectedOption = this.optionsData[centerIndex];                        // Update the selected option
      this.planService.handleMenuChange(this.type, this.selectedOption.value, this.stopped);    // Notify plan service of the change.
      this.selectedValue = this.selectedOption.value;                             // Update the selected value (only holds the string value)
    }
  }

  /** Finds which index of the options array is in the center of the visible window.
   * @return the array index of optionsData that is center.
   */
  private getCenterIndex(): number {
    let val = -1;
    this.optionsData.forEach((e, index) => {
      if (this.isCenter(e)) {
        val = index;
      }
    });
    return val;
  }

  /** Does a boundary check on the menu option html element to determine if it is in the center of the visible window
   * @e the HTML element for the menu option.
   * @return true if element is the center element, false if it is not.
   */
  isCenter(e): boolean {
    if (this.center > e.top && this.center < e.top + this.dividedHeight) {
      return true;
    } else {
      return false;
    }
  }

  /** When the component first loads, the menu items must be arranged so that the first option is in the center of the
   * window and the other elements are moved to their correct locations.  It must first find the index of the menu option
   * to place in the center, then adjust everything else accordingly.
   * @param value the value of the element that sould be located in the center.
  */
  private adjustToCenter(value: any): boolean {
    let firstIndex = -1;                                  // Initialize the first Index to -1
    this.optionsData.forEach((item, index) => {           // Find the correct index of the value that was passed to function.
      if (item.value === value && firstIndex === -1) {
        firstIndex = index;
      }
    });
    if (firstIndex === -1) {
      return false;                                       // Abort if no matching value was found.
    } else {
      const centerIndex = this.getCenterIndex();          // Find the current center index.
      if (centerIndex > 0) {
        const difference = firstIndex - centerIndex;      // The difference shows how many elements need to be moved.
        if (difference > 0) {
          for (let i = difference + 1; i > 0; i--) {
            this.switchOptions(-1);                       // SwitchOptions moves the bottom to the top or vice versa.
            this.moveEachOption(-this.dividedHeight);     // Move each element by the height of one menu option.
          }
        } else if (difference < 0) {
          for (let i = 0; i < Math.abs(difference); i++) {
            this.switchOptions(1);
            this.moveEachOption(this.dividedHeight);
          }
        }
      } else {  // If the center index is < 0
        const currentTop = this.optionsData[Math.floor(this.optionsData.length / 2)].top;
        this.moveEachOption(this.center - currentTop - this.dividedHeight / 2);
        for (let i = 0; i < Math.floor(this.options.length / 2); i++) {
          this.switchOptions(1);
          this.moveEachOption(this.dividedHeight);
        }
      }
      this.positionOptions();  // Move all of the elements to their correct positions as calculated above.
    }
    return true;
  }

  /** The component will always ensure that the selected value is directly in the center of the window
   * when the user stops dragging.  IF it is slightly off, this will move it the rest of the way.
  */
  private centerSelectedValue(): void {
    const distance = this.selectedOption.top + this.dividedHeight / 2 - this.center + 5;   // Find the distance from cetner.
    this.moveEachOption(-distance);   // Update all positions.
    this.positionOptions();           // Execute the move.
  }

  /** Adds or subtracts a number of pixels from the css top value of each element in the menu.  It does not actually muve
   * the elements on the screen, it just updates their object.  PositionElements() does the actual movement based on the value
   * that is set here.
   * @param distance the number of pixels to move each element.
   */
  private moveEachOption(distance: number): void {
    this.optionsData.forEach(e => {
      e.top = e.top + distance;
    });
  }
  /** Stores the touch id that is used for the drag.  This is useful because there can be many touches on
   * the table at the same time and with this value we dont have to find the correct touch each time there is a change.
   * @param touchlist the list of all current touches.
   */
  private setTouchId(touchlist): void {
    if (this.touchId === -1 && touchlist) {
      Object.values(touchlist).forEach((touch: Touch) => {
        if (touch.target === this.overlay.nativeElement) {  // Check if there is a finger on the overlay element.
          this.touchId = touch.identifier;
        }
      });
    }
  }

  /** When the application changes the year from another element, the scrolling menu will adjust itself accordingly.  It will
   * animate the scroll until it reaches the correct element.  It always scrolls in the same direction.
   */
  private autoRotateTo(): void {
    if (this.intervalRunning) {              // If there is an animation running, stop it and call the the function again.
      clearInterval(this.speedInterval);
      this.intervalRunning = false;
      this.autoRotateTo();
    } else {
      this.intervalRunning = true;
      this.speedInterval = setInterval(() => {
        if (this.optionsData[this.getCenterIndex()].value != this.selectedOption.value) {
          this.moveEachOption(30);            // Move each element 5 pixels at a time.
          this.positionOptions();
          this.runningTotal = this.checkRunningTotal(30);
        } else {  // When the correct element is in the center, stop the animation and update the correct values.
          clearInterval(this.speedInterval);
          this.intervalRunning = false;
          this.selectedValue = this.selectedOption.value;
          this.centerSelectedValue();
        }
      }, 5);
    }
  }

  /** The running total is the total distance that the options have moved.  Once it is larger than the height of a single
   * menu option, the bottom option is moved to the top or vice versa.
   * @param sum the distance that was just mvoed.
   * @number the current running total. */
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

  /** Moves the bottom element to the top or the top element to the bottom of the menu.  This is how the menu seems to scroll infinitely.
   * @param sign determines which element should switch places
   */
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

  /** Loops through the position history and adds up the values. */
  private getSum(): number {
    let sum = 0;
    this.positionHistory.forEach((point, index) => {
      if (index > 0) {
        sum += point.pos - this.positionHistory[index - 1].pos;
      }
    });
    return sum;
  }

  /** Calculates the speed that the finger is moveing.  The sum is the distance traveled by the finger and it is divided by the time */
  private getSpeed(): void {
    const sum = this.getSum();
    const speed = sum / (this.positionHistory[this.positionHistory.length - 1].time - this.positionHistory[0].time);
    this.speed = Math.floor(speed * this.repeatRate);
  }

  /** When a finger is lifted, the menu will continue to scroll if the finger was moving fast enough.  This function simulates
   * friction and will slow the menu and eventually stop it.
   */
  private decaySpeed(): void {
    if (Math.abs(this.speed) < 3 || this.speed === 0) {
      this.intervalRunning = false;
      clearInterval(this.speedInterval);
      this.positionHistory = [];
      this.speed = 0;
      this.speedInterval = -1;
      this.stopped = true;
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

  // If the window resizes, update the center of the window.
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.center = this.findCenter();
  }
}
