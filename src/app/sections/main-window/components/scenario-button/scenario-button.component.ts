import { Component, OnInit, Input } from '@angular/core';
import { PlanService } from '@app/services/plan.service';

@Component({
  selector: 'app-scenario-button',
  templateUrl: './scenario-button.component.html',
  styleUrls: ['./scenario-button.component.css']
})
export class ScenarioButtonComponent implements OnInit {

  @Input() scenarioName: string;
  @Input() scenarioDisplayName: string;

  constructor(private planService: PlanService) { }

  ngOnInit() {
  }

  private handleClick():void {
     this.planService.updateScenario(this.scenarioName);
  }

}
