import { Component, AfterViewInit, Input, ViewChild } from '@angular/core';
import { PlanService } from '@app/services/plan.service';

@Component({
  selector: 'app-slider',
  templateUrl: './slider.component.html',
  styleUrls: ['./slider.component.css']
})
export class SliderComponent implements AfterViewInit {

  @ViewChild('slideElement', { static: false }) slideElement;
  @ViewChild('wrapper', { static: false }) wrapperElement;

  @Input() width: number;
  @Input() horizontal: boolean;
  @Input() type: string;
  @Input() category: string;
  @Input() name: string;

  private dragging: boolean;

  constructor(private planService: PlanService) {}

  ngAfterViewInit() {

    this.wrapperElement.nativeElement.style.width = `${this.width}%`;
    this.wrapperElement.nativeElement.style.left = ` ${(100 - this.width) / 2}%`;

    // When css is loaded, move the slide elements to their correct position from the left.
    this.planService.cssSubject.subscribe(cssData => {
      if (cssData) {
        this.setInitialSlidePosition(cssData);
      }
    });

    // If the user cancels the setttings changes, the slide elements on each component must
    // be returned to their previous position.
    this.planService.revertPositionsSubject.subscribe(val => {
      if (val) {
        this.setInitialSlidePosition(val);
      }
    });

    // Mouse Event Listeners
    this.slideElement.nativeElement.addEventListener('mousedown', () => this.startDrag());
    this.slideElement.nativeElement.addEventListener('mouseup', () => this.stopDragging());
    this.slideElement.nativeElement.addEventListener('mouseleave', () => {
      if (this.dragging) {
        this.stopDragging();
      }
    });
    this.slideElement.nativeElement.addEventListener('mousemove', event => {
      if (this.dragging) {
        this.drag(event, this.slideElement);
      }
    });

    // Touch Event Listeners.
    this.slideElement.nativeElement.addEventListener('touchstart', () => this.startDrag(), { passive: false });
    this.slideElement.nativeElement.addEventListener('touchend', () => this.stopDragging(), { passive: false });
    this.slideElement.nativeElement.addEventListener('touchmove', event => {
      if (this.dragging) {
        this.drag(event, this.slideElement);
      }
    }, { passive: false });
  }

  private startDrag(): void {
    this.dragging = true;
  }

  private stopDragging(): void {
    this.dragging = false;
  }

  private drag(event, e): void {
    let percentFromLeft = -1;
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
      const newPosition = left - eWidth / 2;
      if (left > 0 && mousex < parentx + parentWidth) {
        e.nativeElement.style.left = `${newPosition}px`; // Slider is centered on the touch.
        percentFromLeft = left / parentWidth;
      }
    } catch (error) {
      console.log('Error Dragging Slider object');
    } finally {
      this.planService.handleSliderChange(percentFromLeft * 100, this.type, this.category, this.name);
    }
  }

  /** The slideable elements must be positioned to their set position.  For instance, if the user has
   * already resized an element and increased it to 75%, then the element must be moved 75% away from the
   * left of the parent div.
   * @param data this is css data.  It is referenced against the type of the slider.  CSS data paths are hardcoded.
   */
  private setInitialSlidePosition(data: any): void {
    let pos = -1;
    switch (this.type) {
      case 'resize map':
        pos = data.map.percent;
        break;
      case 'resize pie':
        pos = data.charts.pie.percent;
        break;
      case 'resize line':
        pos = data.charts.line.percent;
        break;
      case 'resize data':
        pos = data.data.percent;
        break;
      case 'resize lava':
        pos = data.logos.lava.percent;
        break;
      case 'resize heco':
        pos = data.logos.heco.percent;
        break;
    }

    if (pos >= 0) {
      this.slideElement.nativeElement.style.left = `${pos}%`;
    }
  }
}
