import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { PlanService } from '@app/services/plan.service';
import { WindowService } from '@app/modules/window';

@Component({
  selector: 'app-touch-ui',
  templateUrl: './touch-ui.component.html',
  styleUrls: ['./touch-ui.component.css']
})
export class TouchUiComponent implements AfterViewInit {

  @ViewChild('year', { static: false, read: ElementRef }) yearElement: ElementRef;
  @ViewChild('ttip', { static: false, read: ElementRef }) toolTip: ElementRef;

  private test: string;
  private layers: any[];
  private messageCheckInterval: any;
  private year: number;
  private layerTitle: string;
  private mapTitle: string;
  private chartTitle: string;
  private layerInfoTitle: string;
  private yearTitle: string;
  private scenarioTitle: string;
  private planSet: boolean;
  private setupComplete: boolean;
  private allReady: any;
  private showSettingsModal: boolean;

  private scenarios: any[]; // Array containing all available scenarios in the plan.

  private tooltip: any;

  constructor( private planService: PlanService, private windowService: WindowService) {
    this.setupComplete = false;
    this.showSettingsModal = false;
    this.test = 'testing';
    this.year = 2016;
    this.layerTitle = 'Layer Toggles';
    this.mapTitle = 'Mini Map';
    this.chartTitle = 'Chart';
    this.layerInfoTitle = 'Layer Info';
    this.yearTitle = 'Year';
    this.scenarioTitle = 'Scenario';
    this.planSet = false;
    this.allReady = {};
    this.allReady.layersSet = false;
    this.allReady.planSet = false;
    this.allReady.yearSet = false;
    this.allReady.scenarioSet = false;
    this.layers = [];
    this.tooltip= {};
    this.tooltip.currentlySelected = 'none';
    this.tooltip.displaying = false;
  }

  ngAfterViewInit() {

    this.windowService.windowMessageSubject.subscribe(msg => {
      this.planService.handleMessage(msg);
    });

    this.planService.layersSubject.subscribe(layers => {
      if (layers) {
        this.layers = layers;
        if (!this.allReady.layersSet) {
          this.allReady.layersSet = true;
          this.isSetupComplete();
        }
      }
    });

    this.planService.yearSubject.subscribe(year => {
      if (year) {
        this.year = year;
        if (!this.allReady.yearSet) {
          this.allReady.yearSet = true;
          this.isSetupComplete();
        }
      }
    });

    this.planService.scenarioListSubject.subscribe(scenario => {
      if (scenario) {
        this.scenarios = scenario;
        if (!this.allReady.scenarioSet) {
          this.allReady.scenarioSet = true;
          this.isSetupComplete();
        }
      }
    });

    this.planService.planSetSubject.subscribe(value => {
      if (value) {
        if (!this.allReady.planSet) {
          this.allReady.planSet = value;
          this.isSetupComplete();
        }
      }
    });

    this.windowService.getFileData();

    this.planService.closeModalSubject.subscribe(value => {
      if (value) {
        this.handleSettingsButtonClick();
      }
    });

    this.planService.tooltipSubject.subscribe(value => {
      if (value) {
        this.positionTooltip(value.x, value.y);
      }
    });
  }

  private isSetupComplete(): void {
    if (this.allReady.planSet && this.allReady.scenarioSet && this.allReady.yearSet && this.allReady.layersSet && !this.setupComplete) {
      this.setupComplete = true;
    }
  }

  private handleSettingsButtonClick(): void {
    this.showSettingsModal = !this.showSettingsModal;
  }

  private handleTooltipClick(event, id): void {
    if (this.tooltip.currentlySelected === id) {
      this.tooltip.displaying = !this.tooltip.displaying;
    } else {
      this.tooltip.currentlySelected = id;
      this.tooltip.displaying = true;
    }
    this.planService.handleToolTipEvent(event, id);
  }

  private positionTooltip(x: number, y: number): void {
    this.toolTip.nativeElement.style.left = `${x - 20}px`;
    this.toolTip.nativeElement.style.top = `${y - 12}px`;
  }
}
