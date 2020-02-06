import { Component, OnInit, Input } from '@angular/core';
import { UiServiceService } from '@app/services/ui-service.service';

@Component({
  selector: 'app-scenario-button',
  templateUrl: './scenario-button.component.html',
  styleUrls: ['./scenario-button.component.css']
})
export class ScenarioButtonComponent implements OnInit {

  @Input() scenarioName: string;
  @Input() scenarioDisplayName: string;

  constructor(private uiService: UiServiceService) { }

  ngOnInit() {
  }

  private handleClick():void {
     this.uiService.changeScenario(this.scenarioName);
  }

}
