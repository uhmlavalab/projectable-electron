import { Component, OnInit, Input, HostListener, ElementRef } from '@angular/core';
import { PlanService } from '@app/services/plan.service';
import { NgCircleProgressModule } from 'ng-circle-progress';

@Component({
  selector: 'app-layer-button',
  templateUrl: './layer-button.component.html',
  styleUrls: ['./layer-button.component.css']
})
export class LayerButtonComponent implements OnInit {

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

  constructor(private el: ElementRef, private planService: PlanService) {
    this.animationInterval = -1;
    this.progress = 0;
    this.progressRadius = 0;
    this.on = false;
    this.delay = false;
    this.reversing = false;
    this.loading = false;
  }

  ngOnInit() {
    this.progressRadius = this.el.nativeElement.getBoundingClientRect().height / 2;
  }

  private handleClick(): void {
    this.planService.handleLayerButtonInfoClick(this.layerName);
  }

  private toggleButtonOn(): void {
    if (this.animationInterval < 0) {
      this.animationInterval = setInterval(() => {
        this.progress++;
        if (this.progress >= 100) {
          this.on = true;
          this.planService.handleLayerButtonClick(this.layerName);
          this.planService.handleLayerButtonInfoClick(this.layerName);
          this.stopAnimation();
        }
      }, 5);
      return;
    } else {
      this.stopAnimation();
    }
  }

  private toggleButtonOff(): void {
    if (this.animationInterval < 0) {
      this.animationInterval = setInterval(() => {
        this.progress--;
        if (this.progress <= 0) {
          this.on = false;
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

  private reverseAnimate(): void {
    this.animationInterval = setInterval(() => {
      if (this.progress > -2) {
        this.progress--;
      } else {
        this.stopAnimation();
      }
    }, 5);
  }

  private animate(): void {
    this.animationInterval = setInterval(() => {
      if (this.progress < 101) {
        this.progress++;
      } else {
        this.stopAnimation();
      }
    }, 5);
  }


  /** When these toggles are touched, they show a loading up animation */
  @HostListener('touchstart') onTouchStart(event: TouchEvent) {
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

  @HostListener('mousedown') onMouseDown(event: Event) {
    if (this.on) {
      if (this.animationInterval > -1) {
        this.stopAnimation();
        this.toggleButtonOff();
      } else if (!this.delay) {
        this.toggleButtonOff();
      }
    } else {
      if (!this.delay) {
        this.toggleButtonOn();
      }
    }
  }

  /** If the animation isnt finished, it will end prematurely if the touch is ended. */
  @HostListener('touchend') onTouchEnd() {
    this.stopAnimation();
    if (this.progress > 0 && !this.on) {
      this.reverseAnimate();
    } else if (this.progress < 100 && this.on) {
      this.animate();
    }
  }

  /** If the animation isnt finished, it will end prematurely if the touch is ended. */
  @HostListener('mouseup') onMouseUp() {
    this.stopAnimation();
    if (this.progress > 0 && !this.on) {
      this.reverseAnimate();
    } else if (this.progress < 100 && this.on) {
      this.animate();
    }
  }
}


