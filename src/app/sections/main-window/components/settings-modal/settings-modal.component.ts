import { Component, ViewChild, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-settings-modal',
  templateUrl: './settings-modal.component.html',
  styleUrls: ['./settings-modal.component.css']
})
export class SettingsModalComponent implements AfterViewInit {

  @ViewChild('mapMover', { static: false }) mapElement;
  @ViewChild('pieMover', { static: false }) pieElement;
  @ViewChild('lineMover', { static: false }) lineElement;

  private dragging: boolean;
  private touchId: number;

  constructor() {
    this.dragging = false;
    this.touchId = -1;
  }

  ngAfterViewInit() {

    this.mapElement.nativeElement.addEventListener('touchstart', event => {
      this.startDrag(event.touches, this.mapElement);
    }, { passive: false });
    this.mapElement.nativeElement.addEventListener('touchend', () => {
      this.stopDrag();
    }, { passive: false });
    this.mapElement.nativeElement.addEventListener('touchmove', event => {
      if (this.dragging) {
        this.drag(event, this.mapElement, 'map');
      }
    }, { passive: false });

    this.pieElement.nativeElement.addEventListener('touchstart', event => {
      this.startDrag(event.touches, this.pieElement);
    }, { passive: false });
    this.pieElement.nativeElement.addEventListener('touchend', () => {
      this.stopDrag();
    }, { passive: false });
    this.pieElement.nativeElement.addEventListener('touchmove', event => {
      if (this.dragging) {
        this.drag(event, this.pieElement, 'pie');
      }
    }, { passive: false });

    this.lineElement.nativeElement.addEventListener('touchstart', event => {
      this.startDrag(event.touches, this.lineElement);
    }, { passive: false });
    this.lineElement.nativeElement.addEventListener('touchend', () => {
      this.stopDrag();
    }, { passive: false });
    this.lineElement.nativeElement.addEventListener('touchmove', event => {
      if (this.dragging) {
        this.drag(event, this.lineElement, 'line');
      }
    }, { passive: false });
  }

  private startDrag(touches, el): void {
    this.dragging = true;
    this.setTouchId(touches, el);
  }

  private drag(event, el, identifier): number {
    try {
      let mouseY = null;
      let mouseX = null;

      if (this.touchId >= 0) {
        mouseY = event.touches[this.touchId].screenY;
        mouseX = event.touches[this.touchId].screenX;
      }

      if (mouseY && mouseX) {
        el.nativeElement.style.top = `${mouseY - 200}px`;
        el.nativeElement.style.left = `${mouseX - 200}px`;
      }

    } catch (error) {
      console.log(error);
      console.log('Error Dragging Menu object');
    } finally {
      return 0;
    }
  }

  private stopDrag(): void {
    this.dragging = false;
    this.touchId = -1;
  }

  private setTouchId(touchlist, el): void {
    if (this.touchId === -1 && touchlist) {
      Object.values(touchlist).forEach((touch: Touch) => {
        if (touch.target === el.nativeElement) {
          this.touchId = touch.identifier;
        }
      });
    }
  }
}
