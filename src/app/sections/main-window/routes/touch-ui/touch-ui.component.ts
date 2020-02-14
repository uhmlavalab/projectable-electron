import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { PlanService } from '@app/services/plan.service';
import { Plan } from '@app/interfaces/plan';
import { UiServiceService } from '@app/services/ui-service.service';
import { WindowService } from '@app/modules/window';

@Component({
  selector: 'app-touch-ui',
  templateUrl: './touch-ui.component.html',
  styleUrls: ['./touch-ui.component.css']
})
export class TouchUiComponent implements AfterViewInit {

  @ViewChild('year', { static: false, read: ElementRef }) yearElement: ElementRef;

  private test: string;
  private layers: any;
  private messageCheckInterval: any;
  private year: number;
  private layerTitle: string;
  private mapTitle: string;
  private chartTitle: string;
  private layerInfoTitle: string;
  private yearTitle: string;
  private scenarioTitle: string;
  private planSet: boolean;
  private showSettingsModal: boolean;

  private scenarios: any[]; // Array containing all available scenarios in the plan.

  constructor(private uiService: UiServiceService, private planService: PlanService, private windowService: WindowService) {
    this.test = 'testing';
    this.year = 9999;
    this.layerTitle = 'Layer Toggles';
    this.mapTitle = 'Mini Map';
    this.chartTitle = 'Chart';
    this.layerInfoTitle = 'Layer Info';
    this.yearTitle = 'Year';
    this.scenarioTitle = 'Scenario';
    this.planSet = false;
    this.showSettingsModal = false;
  }

  ngAfterViewInit() {
    // Checks for new messages on a selected time interval.  The faster the interval, less lag between windows.
    this.windowService.windowMessageSubject.subscribe(message => {
      console.log(message);
    })

    this.planService.yearSubject.subscribe(year => {
      if (year) {
        this.year = year;
      }
    });

    this.planService.scenarioListSubject.subscribe(scenario => {
      if (scenario) {
        this.scenarios = scenario;
      }
    });

    this.planService.planSubject.subscribe(plan => {
      if (plan) {
        this.planSet = true;
        this.setupUI(plan);
      }
    });
  }

  /** When a new message is received by a component, it is decoded here
   * @param msg the message that was received.  It is a string is must be parsed to
   * JSON format.
   */
  private reviewMessage(msg: string): void {
    const data = JSON.parse(msg);
    // If there is a new message, the newMsg value will be true.  Otherwise it is 'false'.
    if (data.newMsg === 'true') {
      if (data.type === 'plan') {  // Only called when the map is changed.
        this.setupUI(this.uiService.setCurrentPlan(data.data));
      } else if (data.type === 'year') {
        this.year = data.data;
      }
      //this.uiService.clearMessages(); // Always set newMsg to 'false' after reading it.
    }
  }

  private setupUI(plan: Plan): void {
    this.year = this.planService.getCurrentYear();
    this.test = plan.displayName;
    this.layers = plan.map.mapLayers;
    console.log(this.layers);
  }

  /**
   * The touch ui component runs a second plan service so that we can duplicate components.
   * @param plan => Contains the island that will be used for this program.
   * @return Returns the current year.
   */
  startPlanService(plan: Plan): number {
    return this.planService.startTheMap(plan);
  }

  toggleLayer(event, layer) {
    if(event.type == 'click') {
      console.log(event, layer);
      this.planService.toggleSelectedLayer(layer.name);
    }

  }

  private handleSettingsButtonClick(): void {
    this.showSettingsModal = !this.showSettingsModal;
  }

}
