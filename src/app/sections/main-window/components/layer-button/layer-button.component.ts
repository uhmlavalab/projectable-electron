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
  private animationDuration: number;
  private progress: number;
  private progressRadius: number;
  private on: boolean;

  constructor(private uiService: UiServiceService, private el: ElementRef, private planService: PlanService) {
    this.animationDuration = 700;
    this.progress = 0;
    this.progressRadius = 0;
    this.on = false;
  }

  ngOnInit() {
    this.progressRadius = this.el.nativeElement.getBoundingClientRect().height / 2;
  }

  private handleClick(): void {
    this.uiService.sendMessage({ type: 'layer-update', data: this.layerName, newMsg: 'true' });
    this.planService.toggleSelectedLayer(this.layerName);
  }

  /** When these toggles are touched, they show a loading up animation */
  @HostListener('touchstart') onTouchStart(event: TouchEvent) {
    // Start the effect
    if (this.progress === 0) {
      this.progress = 100;
      setTimeout(() => {
        if (this.progress === 100) {
          this.on = true;
          this.uiService.sendMessage({ type: 'layer-update', data: this.layerName, newMsg: 'true' });
          this.planService.toggleSelectedLayer(this.layerName);
        }
      }, this.animationDuration * 2);
    } else if (this.progress === 100 && this.on) {
      this.progress = 0;
      this.on = false;
      this.uiService.sendMessage({ type: 'layer-update', data: this.layerName, newMsg: 'true' });
      this.planService.toggleSelectedLayer(this.layerName);
    }
  }

  /** If the animation isnt finished, it will end prematurely if the touch is ended. */
  @HostListener('touchend') onTouchEnd() {
    // End the effect if it is still going
    if (!this.on) {
      this.progress = 0;
    }
  }

}
