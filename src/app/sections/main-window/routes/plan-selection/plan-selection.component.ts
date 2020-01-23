import { Component, OnInit } from '@angular/core';
import { WindowService } from '@app/modules/window';

@Component({
  selector: 'app-plan-selection',
  templateUrl: './plan-selection.component.html',
  styleUrls: ['./plan-selection.component.css']
})
export class PlanSelectionComponent implements OnInit {

  constructor(private windowService: WindowService) { }

  ngOnInit() {
    this.windowService.sendMessage(["hihi from MainWindow", {animal: 'cat'}]);
  }

}
