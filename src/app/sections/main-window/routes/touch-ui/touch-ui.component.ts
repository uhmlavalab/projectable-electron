import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { PlanService } from '@app/services/plan.service';
import { WindowService } from '@app/modules/window';
import { Scenario, MapLayer } from '@app/interfaces';

@Component({
  selector: 'app-touch-ui',
  templateUrl: './touch-ui.component.html',
  styleUrls: ['./touch-ui.component.css']
})
export class TouchUiComponent implements AfterViewInit {

  @ViewChild('year', { static: false, read: ElementRef }) yearElement: ElementRef;
  @ViewChild('ttip', { static: false, read: ElementRef }) toolTip: ElementRef;
  @ViewChild('slideMenu', { static: false, read: ElementRef }) slideMenu: ElementRef;
  @ViewChild('lineChartDiv', { static: false, read: ElementRef }) lineDiv: ElementRef;
  @ViewChild('pieChartDiv', { static: false, read: ElementRef }) pieDiv: ElementRef;
  @ViewChild('loadingScreen', { static: false, read: ElementRef }) loadingScreen: ElementRef;

  private layers: { layer: MapLayer, state: number }[];              // Array containing all Layers (used to populate toggle buttons).
  private sectionTitles: { layer: string; map: string; scenario: string; };  // Used to label HTML elements.
  private tooltip: { displaying: boolean, path: string; currentlySelected: string; }; // Tooltip data
  private setupComplete: boolean;      // True when all necessary elements are published by the plan service.
  private allReady: { layersSet: boolean; planSet: boolean; yearSet: boolean; scenarioSet: boolean; };  // Necessary elements.
  private settingsIconPath: string;    // Path to the settings icon.
  private showSettingsModal: boolean;  // True, show the reposition modal, false hide it.
  private technologies: { name: string; color: string }[];
  private menuInterval: any;           // Animation interval for the slide menu.
  private sliding: boolean;            // True if animation is happening.
  private firstSlide: boolean;         // Prevents first slide when loading
  private slideDistance: number;       // This is the width of the slide menu. It must side this far off screen to hide it.
  private islandName: string;          // Holds the name of the island to change layour for lanai.

  constructor(private planService: PlanService, private windowService: WindowService) {
    this.setupComplete = false;
    this.showSettingsModal = false;
    this.sectionTitles = { layer: 'Layer Toggles', map: 'Mini Map', scenario: 'Scenario' };
    this.allReady = { layersSet: false, planSet: false, yearSet: false, scenarioSet: false };
    this.layers = [];
    this.tooltip = { displaying: false, path: '../../../../../assets/images/tooltip.png', currentlySelected: 'none' };
    this.settingsIconPath = '../../../../../assets/images/gear-icon.png';
    this.technologies = [];
    this.sliding = false;
    this.firstSlide = true;
    this.slideDistance = 0; // This distance is set dynamically after component is loaded.
    this.islandName = '';
  }

  ngAfterViewInit() {

    // Set subscription to remove loading image
    this.windowService.loadingSubject.subscribe(val => {
      this.loadingScreen.nativeElement.style.display = val ? 'block' : 'none';
    });

    // Set the position of the slide menu.
    this.slideDistance = this.slideMenu.nativeElement.getBoundingClientRect().width;
    this.slideMenu.nativeElement.style.left = -this.slideDistance + 'px';

    // Set the position of the charts
    this.positionPieChart();
    this.positionLineChart();

    // Since this is the lowest level component of the touch interface, this receives the messages from the map.
    this.windowService.windowMessageSubject.subscribe(msg => {
      this.planService.handleMessage(msg);
    });

    // Stores the layers to populate the layer toggle buttons.
    this.planService.layersSubject.subscribe(layers => {
      if (layers) {
        setTimeout(() => { this.layers = layers; });
        if (!this.allReady.layersSet) {
          this.allReady.layersSet = true;
          this.isSetupComplete();
        }
      }
    });

    this.planService.islandNameSubject.subscribe(island => {
      if (island) {
        this.islandName = island;
      }
    });

    // Makes sure the year has been set in the plan service.
    this.planService.yearSubject.subscribe(year => {
      if (year) {
        if (!this.allReady.yearSet) {
          this.allReady.yearSet = true;
          this.isSetupComplete();
        }
      }
    });

    // Only checks to see that this is set.  Doesnt store any data.
    this.planService.scenarioListSubject.subscribe(scenario => {
      if (scenario) {
        if (!this.allReady.scenarioSet) {
          this.allReady.scenarioSet = true;
          this.isSetupComplete();
        }
      }
    });

    // Notifies when the plan is ready to go.
    this.planService.planSetSubject.subscribe(value => {
      if (value) {
        if (!this.allReady.planSet) {
          this.allReady.planSet = value;
          this.isSetupComplete();
        }
      }
    });

    this.planService.freshCssSubject.subscribe((val: boolean) => {
      if (val) {
        this.showSettingsModal = val;
      }
    });

    this.planService.technologySubject.subscribe((val: any) => {
      if (val) {
        this.technologies = val;
      }
    });

    this.windowService.getFileData();  // Nptifies the window service to get the data from any files and publish it.

    // Subscribes to a variable that tells whether to open or close the modal.
    this.planService.closeModalSubject.subscribe(value => {
      if (value) {
        this.handleSettingsButtonClick(false);
      }
    });

    // Subscribes to a bariable that tells whether to open or close the modal.
    this.planService.openPositionModalSubject.subscribe(value => {
      if (value) {
        this.handleSettingsButtonClick(true);
      }
    });

    // When user clicks on a tooltip, the location of the tooltip is received here and the element is moved.
    this.planService.tooltipSubject.subscribe(value => {
      if (value) {
        this.positionTooltip(value.x, value.y);
      }
    });

    // When user clicks on the gear icon, the menu slides open or closed
    this.planService.slideOutSubject.subscribe(open => {
      if (!this.firstSlide) {
        this.toggleSlideOut(open);
      } else {
        this.firstSlide = false;
      }
    });
  }

  private positionPieChart(): void {
    const height = window.innerHeight;
    this.pieDiv.nativeElement.style.top = height * 0.05 + 'px';
    const pWidth = this.pieDiv.nativeElement.parentNode.getBoundingClientRect().width;
    this.pieDiv.nativeElement.style.left = (pWidth - 300) / 2 + 'px';
  }

  private positionLineChart(): void {
    const height = window.innerHeight;
    this.lineDiv.nativeElement.style.top = height * 0.40 + 'px';
    this.lineDiv.nativeElement.style.height = height * 0.55 + 'px';
    const pWidth = this.lineDiv.nativeElement.parentNode.getBoundingClientRect().width;
    //this.lineDiv.nativeElement.style.left = (pWidth - 400) / 2 + 'px';
    this.lineDiv.nativeElement.style.paddingTop = '20px';
  }

  /** Checks to see if the setup is completed.  If it is, the setup Complete variable is set to true. */
  private isSetupComplete(): void {
    if (this.allReady.planSet && this.allReady.scenarioSet && this.allReady.yearSet && this.allReady.layersSet && !this.setupComplete) {
      this.setupComplete = true;
    }
  }

  /** opens and closes the settings (positioning) modal. */
  private handleSettingsButtonClick(val): void {
    this.showSettingsModal = val;
  }

  /** When a tooltip is clicked, the position and identifying string are passed here and the correct action is taken by the plan service.
   * @param event the touch or click event.  (gets the x and y position to reposition the tooltip.)
   * @param id the string identifying which tooltip was clicked.
   */
  private handleTooltipClick(event, id: string): void {
    if (this.tooltip.currentlySelected === id) {
      this.tooltip.displaying = !this.tooltip.displaying;
    } else {
      this.tooltip.currentlySelected = id;
      this.tooltip.displaying = true;
    }
    this.planService.handleToolTipEvent(event, id);
  }

  /** Positions the tooltip where the user clicked. Small amounts of padding are added to try to keep the icon from overlapping the outline.
   * @param x the x position in pixels.
   * @param y the y position in pixels.
   */
  private positionTooltip(x: number, y: number): void {
    this.toolTip.nativeElement.style.left = `${x - 20}px`;
    this.toolTip.nativeElement.style.top = `${y - 12}px`;
  }

  /** Controls the slide in and out of the settings menu. */
  private toggleSlideOut(open: boolean): void {
    if (!this.sliding) {
      try {
        clearInterval(this.menuInterval);
      } catch (e) { }
      finally {
        this.sliding = true;
        if (open) {
          let left = -this.slideDistance;
          this.menuInterval = setInterval(() => {
            if (left >= 0) {
              clearInterval(this.menuInterval);
              this.sliding = false;
            } else {
              left = left + 20;
              this.slideMenu.nativeElement.style.left = `${left}px`;
            }
          }, 30);
        } else {
          let left = 0;
          this.menuInterval = setInterval(() => {
            if (left <= -this.slideDistance) {
              clearInterval(this.menuInterval);
              this.sliding = false;
            } else {
              left = left - 20;
              this.slideMenu.nativeElement.style.left = `${left}px`;
            }
          }, 30);
        }
      }
    }

  }
}
