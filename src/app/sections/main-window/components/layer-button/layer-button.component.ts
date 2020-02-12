import { Component, OnInit, Input, HostListener, ElementRef } from '@angular/core';
import { UiServiceService } from '@app/services/ui-service.service';
import { PlanService } from '@app/services/plan.service';
import { NgCircleProgressModule } from 'ng-circle-progress';
import { TimeInterval } from 'rxjs';

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

  constructor(private uiService: UiServiceService, private el: ElementRef, private planService: PlanService) {
    this.animationInterval = -1;
    this.progress = 0;
    this.progressRadius = 0;
    this.on = false;
  }

  ngOnInit() {
    this.progressRadius = this.el.nativeElement.getBoundingClientRect().height / 2;
  }


  /** When these toggles are touched, they show a loading up animation */
  @HostListener('touchstart') onTouchStart(event: TouchEvent) {

    if (this.progress >= 100) {
      this.progress = 0;
      this.on = false;
      this.uiService.sendMessage({ type: 'layer-update', data: this.layerName, newMsg: 'true' });
      this.planService.toggleSelectedLayer(this.layerName);
    }
    // Start the effect
    if (this.animationInterval < 0) {
      this.animationInterval = setInterval(() => {
        this.progress++;
        if (this.progress >= 100) {
          if (this.on === false) {
            this.on = true;
            this.uiService.sendMessage({ type: 'layer-update', data: this.layerName, newMsg: 'true' });
            this.planService.toggleSelectedLayer(this.layerName);
          }
          this.stopAnimation(this.animationInterval);
        }
      }, 5);
    } else {
      this.stopAnimation(this.animationInterval);
    }
  }

  private stopAnimation(intervalId): void {
    clearInterval(intervalId);
  }

  private reverseAnimate(): void {
    this.animationInterval = setInterval(() => {
      if (this.progress > 0) {
        this.progress--;
      } else {
        this.stopAnimation(this.animationInterval);
      }
    }, 5);
  }

  /** If the animation isnt finished, it will end prematurely if the touch is ended. */
  @HostListener('touchend') onTouchEnd() {
    if (!this.on) {
      this.stopAnimation(this.animationInterval);
      if (this.progress > 0) {
        this.reverseAnimate();
      }
    }
  }
}


