import { Component, ViewChild, ElementRef } from '@angular/core';
import { WindowService } from '@app/modules/window';

@Component({
  selector: 'app-plan-selection',
  templateUrl: './plan-selection.component.html',
  styleUrls: ['./plan-selection.component.css']
})
export class PlanSelectionComponent  {

  @ViewChild("mapViewNode", { static: true }) private mapViewEl: ElementRef;
  view: any;

  constructor(private windowService: WindowService) { }


  reset() {
    this.windowService.resetAllWindows();
  }
}
