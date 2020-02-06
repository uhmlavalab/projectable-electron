import { Component, AfterViewInit, Input, ViewChild, ElementRef, ɵCompiler_compileModuleSync__POST_R3__ } from '@angular/core';
import { UiServiceService } from '@app/services/ui-service.service';

@Component({
  selector: 'app-slider',
  templateUrl: './slider.component.html',
  styleUrls: ['./slider.component.css']
})
export class SliderComponent implements AfterViewInit {

  @ViewChild('slideElement', { static: false }) slideElement;

  @Input() type: string;

  private dragging: boolean;

  constructor(private uiService: UiServiceService) {

  }

  ngAfterViewInit() {
    this.slideElement.nativeElement.addEventListener('mousedown', () => this.startDrag());
    this.slideElement.nativeElement.addEventListener('mouseup', () => this.stopDragging());
    this.slideElement.nativeElement.addEventListener('mouseleave', () => {
      if (this.dragging) {
        this.stopDragging()
      }
    });
    
    this.slideElement.nativeElement.addEventListener('mousemove', event => {
      if (this.dragging) {
        this.uiService.changeYear(this.drag(event, this.slideElement));
      }
    });

    this.slideElement.nativeElement.addEventListener('touchstart', () => {
      this.startDrag();
    }, { passive: false });
    this.slideElement.nativeElement.addEventListener('touchend', () => {
      this.stopDragging();
    }, { passive: false });
    this.slideElement.nativeElement.addEventListener('touchmove', event => {
      if (this.dragging) {
        this.uiService.changeYear(this.drag(event, this.slideElement));
      }
    }, { passive: false });
  }

  incrementYear() {
    this.uiService.incrementYear();
  }

  decrementYear() {
    this.uiService.decrementYear();
  }

  private startDrag(): void {
    this.dragging = true;
  }

  private stopDragging(): void {
    this.dragging = false;
  }

  private drag(event, e): number {
    let percentFromLeft = -1
    try {
      // Capture X position of mouse or touch
      let mousex = event.screenX;
      if (mousex === undefined) {
        Object.values(event.touches).forEach((touch: Touch) => {
          if (touch.target === e.nativeElement) {
            mousex = touch.screenX;
          }
        });
      }
      // Find slide element width and parent size.
      const eWidth = e.nativeElement.getBoundingClientRect().width;
      const parentx = e.nativeElement.parentElement.getBoundingClientRect().left;
      const parentWidth = e.nativeElement.parentElement.getBoundingClientRect().width;
      const left = mousex - parentx; // Left boundary of element
      // Slider is bounded
      let newPosition = left - eWidth / 2;
      if (left > 0 && mousex < parentx + parentWidth) {
        e.nativeElement.style.left = `${newPosition}px`; // Slider is centered on the touch.
        percentFromLeft = left / parentWidth;
      }
    } catch (error) {
      console.log('Error Dragging Slider object');
    } finally {
      return percentFromLeft;
    }
  }

}
