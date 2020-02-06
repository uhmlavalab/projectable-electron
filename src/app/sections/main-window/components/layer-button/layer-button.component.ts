import { Component, OnInit, Input, HostListener, ElementRef } from '@angular/core';
import { UiServiceService } from '@app/services/ui-service.service';
import { PlanService } from '@app/services/plan.service';

@Component({
  selector: 'app-layer-button',
  templateUrl: './layer-button.component.html',
  styleUrls: ['./layer-button.component.css'],
  host: {
    '(click)': 'handleClick()'
  }
})
export class LayerButtonComponent implements OnInit {

  @Input() layerName: string;
  @Input() layerDisplayName: string;
  @Input() layerIcon: string;

  constructor(private uiService: UiServiceService, private el: ElementRef, private planService: PlanService) {

  }

  ngOnInit() {
  }

  private handleClick(): void {
    this.uiService.sendMessage({ type: 'layer-update', data: this.layerName, newMsg: 'true' });
    this.planService.toggleSelectedLayer(this.layerName);
  }

  /** When these toggles are touched, they show a loading up animation */
  @HostListener('touchstart') onTouchStart(event: TouchEvent) {
    // Start the effect
    this.el.nativeElement.style.backgroundColor =  'blue';
  }

  /** If the animation isnt finished, it will end prematurely if the touch is ended. */
  @HostListener('touchend') onTouchEnd() {
    // End the effect if it is still going
    this.el.nativeElement.style.backgroundColor = 'transparent';
  }

}
