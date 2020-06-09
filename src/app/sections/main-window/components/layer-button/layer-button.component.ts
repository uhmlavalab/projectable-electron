import { Component, OnInit, Input, HostListener, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { PlanService } from '@app/services/plan.service';

@Component({
  selector: 'app-layer-button',
  templateUrl: './layer-button.component.html',
  styleUrls: ['./layer-button.component.css']
})
export class LayerButtonComponent implements OnInit, AfterViewInit {

  @ViewChild('block', {static: false}) block;  // There is a square that rotates creating an animation.

  @Input() layerName: string;
  @Input() layerDisplayName: string;
  @Input() layerIcon: string;
  @Input() color: string;
  private animationInterval: any;
  private progress: number;
  private progressRadius: number;
  private on: boolean;
  private delay: boolean;
  private reversing: boolean;
  private loading: boolean;
  private rotateInterval : any;
  private currentRotation: number;
  private rotate: boolean;

  constructor(private el: ElementRef, private planService: PlanService) {
    this.animationInterval = -1;
    this.progress = 0;
    this.on = false;
    this.delay = false;
    this.reversing = false;
    this.loading = false;
    this.currentRotation = 0;
    this.rotate = false;
  }

  ngOnInit() {
    this.progressRadius = this.el.nativeElement.getBoundingClientRect().height / 2; // Set the size of the progress circle.
  }

  ngAfterViewInit() {
    this.positionBlock(); // Position the rotation animation block.
    this.rotateBlock();   // Begin the block rotation.
  }

  /** Positions the block.  These values are hard coded and changing them will mess up the positioning. */
  private positionBlock() {
    this.block.nativeElement.style.width = `${this.progressRadius + 44}px`;
    this.block.nativeElement.style.height = `${this.progressRadius + 44}px`;
    this.block.nativeElement.style.left = '7px';
    this.block.nativeElement.style.top = '-3px';
  }

  /** The block constatly rotates whether it is visible or not.  To stop the animation the opacity is toggled. */
  private rotateBlock() {
    this.rotateInterval = setInterval( () => {
      this.currentRotation = (this.currentRotation + 0.5) % 360;
      this.block.nativeElement.style.transform = `rotate(${this.currentRotation}deg)`;
    }, 5);
  }

  /** The layer button can be clicked instead of pressed.  If clicked, it will load info. */
  private handleClick(): void {
    if (this.on) {
      this.rotate = true;
    }
    this.planService.handleLayerButtonInfoClick(this.layerName);
  }

  /** Executes the animation for loading the button */
  private toggleButtonOn(): void {
    if (this.animationInterval < 0) {
      this.animationInterval = setInterval(() => {
        this.progress++;    // Increment until progress = 100
        if (this.progress >= 100) {  // At this point the animation is finished.
          this.on = true;            // Button is on.
          this.rotate = true;        // Show the rotation.
          this.planService.handleLayerButtonClick(this.layerName);     // Notify plan service.
          this.planService.handleLayerButtonInfoClick(this.layerName);
          this.stopAnimation();  // Stop the animation.
        }
      }, 5);
      return;
    } else {
      this.stopAnimation();
    }
  }

  /** Executes the animation for unloading the layer. */
  private toggleButtonOff(): void {
    if (this.animationInterval < 0) {
      this.animationInterval = setInterval(() => {
        this.progress--;  // Decrement until progress = 0.
        if (this.progress <= 0) {
          this.on = false;  // Layer if now off.
          this.planService.handleLayerButtonClick(this.layerName);
          this.stopAnimation();
          this.delay = true;
          setTimeout(() => {
            this.delay = false;
          }, 100);
        }
      }, 5);
      return;
    } else {
      this.stopAnimation();
    }
  }

  private stopAnimation(): void {
    if (this.animationInterval > -1) {
      clearInterval(this.animationInterval);
      this.animationInterval = -1;
    }
  }

  /** Counterclockwise animation without a toggle */
  private reverseAnimate(): void {
    this.animationInterval = setInterval(() => {
      if (this.progress > -2) {
        this.progress--;
      } else {
        this.stopAnimation();
      }
    }, 5);
  }

  /** Clockwise animation without a toggle */
  private animate(): void {
    this.animationInterval = setInterval(() => {
      if (this.progress < 101) {
        this.progress++;
      } else {
        this.stopAnimation();
      }
    }, 5);
  }

  private onEventStart() {
    this.rotate = false;
    if (this.on) {
      if (this.animationInterval > -1) {
        this.stopAnimation();
        this.toggleButtonOff();
      } else if (!this.delay) {
        this.toggleButtonOff();
      }
    } else {
      if (this.animationInterval > -1) {
        this.stopAnimation();
        this.toggleButtonOn();
      } else if (!this.delay) {
        this.toggleButtonOn();
      }
    }
  }

  private onEventEnd() {
    this.stopAnimation();
    if (this.progress > 0 && !this.on) {
      this.reverseAnimate();
    } else if (this.progress < 100 && this.on) {
      this.rotate = true;
      this.animate();
    } else if (this.progress === 100) {
      this.rotate = true;
    }
  }


  /** When these toggles are touched, they show a loading up animation */
  @HostListener('touchstart') onTouchStart(event: TouchEvent) {
    this.onEventStart();
  }

  @HostListener('mousedown') onMouseDown(event: Event) {
    this.onEventStart();
  }

  /** If the animation isnt finished, it will end prematurely if the touch is ended. */
  @HostListener('touchend') onTouchEnd() {
    this.onEventEnd();
  }

  /** If the animation isnt finished, it will end prematurely if the touch is ended. */
  @HostListener('mouseup') onMouseUp() {
    this.onEventEnd();
  }
}


