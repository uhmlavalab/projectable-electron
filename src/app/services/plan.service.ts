import { Injectable, ɵCompiler_compileModuleSync__POST_R3__ } from '@angular/core';
import { _ } from 'underscore';
import { Plan } from '@app/interfaces/plan';
import { Plans } from '../../assets/plans/plans';
import { Scenario, Map, MapLayer } from '@app/interfaces';
import { BehaviorSubject, Subject } from 'rxjs';
import {chartColors} from '../../assets/plans/defaultColors';
import { SoundsService } from '@app/sounds';
import * as d3 from 'd3/d3.min';
import { WindowService } from '@app/modules/window';

@Injectable({
  providedIn: 'root'
})
export class PlanService {

  private state: string;  // Current state of the machine
  private isMain: boolean; // True if main map, false if ui.

  private currentMap: Map;                      // Current Map

  private layers: MapLayer[] = [];              // Array Holding All Layers
  private selectedLayer: MapLayer;              // Currently Selected Layer
  public selectedLayerSubject = new BehaviorSubject<MapLayer>(null); // layer publisher
  public toggleLayerSubject = new BehaviorSubject<MapLayer>(null);      // Pubisher for when a layer is toggled
  public updateLayerSubject = new BehaviorSubject<MapLayer>(null);
  public layerChangeSubject = new BehaviorSubject<string>(null);
  public layersSubject = new BehaviorSubject<any[]>(null);

  public scrollingMenuSubject = new BehaviorSubject<any>(null);

  private plans: Plan[];                        // Array Holding All Plans
  private currentPlan: Plan;                    // Currently Active Plan
  public planSubject = new BehaviorSubject<Plan>(null);     // Plan Publisher

  private scenarios: Scenario[];                // Array Holding All Scenarios
  private currentScenario: Scenario;            // Currently active scenario
  public scenarioSubject = new BehaviorSubject<Scenario>(null); // Scenario publisher
  public scenarioListSubject = new BehaviorSubject<any[]>(null);

  private currentYear: number;                  // Current year
  public yearSubject = new BehaviorSubject<number>(null);   // Year Publisher
  public yearsSubject = new BehaviorSubject<number[]>(null);

  private legendLayouts: string[] = [];         // Array holding possible layouts (grid / vertical)
  private currentLegendLayout: number;          // Currently selected legend layout
  public legendSubject = new BehaviorSubject<string>(null); // Legend Publisher

  public technologySubject = new BehaviorSubject<any>(null);

  /* Reset Subjects */
  public resetLayersSubject = new Subject<any>();

  /* Data Objects */
  private capacityData = {};
  private generationData = {};
  private curtailmentData = {};


  constructor(private soundsService: SoundsService, private windowService: WindowService) {
    this.plans = Plans;
    this.state = 'landing'; // Initial state is landing
    this.legendLayouts = ['grid', 'vertical'];
    this.currentLegendLayout = 0;
  }


  /* Start The Map */
  public startTheMap(plan: Plan): number {
    this.currentPlan = plan;
    this.setupSelectedPlan(this.currentPlan);
    this.setState('run');
    this.windowService.sendMessage({ type: 'state', message: 'run', plan: plan })
    return this.getCurrentYear();
  }

  /** Sets Up the Current Plan
   * @param plan The plan to set up
   */
  public setupSelectedPlan(plan: Plan): void {

    this.currentMap = plan.map; // Sets the base map image.

    // Load layers array with each layer associated with the current map.
    this.currentMap.mapLayers.forEach(layer => {
      if (layer.included) {
        this.layers.push(layer);
      }
    });

    this.selectedLayer = this.layers[0];  // This is the layer that can currently be added/removed.
    this.currentYear = this.currentPlan.minYear;  // Begin with the lowest allowed year.
    this.scenarios = this.currentPlan.scenarios;  // Load array with all scenarios associated with this plan
    this.currentScenario = this.scenarios[0];     // Always start with index 0.

    // Publish the data to the components.
    this.planSubject.next(plan); // Publish the current plan.
    this.yearSubject.next(this.currentYear);      // Publish current year
    this.yearsSubject.next(this.getYears());
    this.scenarioListSubject.next(this.scenarios); // Publish a list of scenarios.
    this.layersSubject.next(this.layers); // Publish All Layers
    this.selectedLayerSubject.next(this.selectedLayer); // Publish current selected layer
    this.scenarioSubject.next(this.currentScenario); // Publish current scenario

    // Load All Plan Data
    this.getCapacityData();
    this.getGenerationData().then(genData => {
      this.generationData = genData;
      this.technologySubject.next(this.getTechData());
    });
    this.getCurtailmentData();



    // Change Legend Layout if it is not 'grid'.
    if (this.currentPlan.css.legend.defaultLayout === 'vertical') {
      this.changeCurrentLegendLayout();
    }
  }

  /****************************************************************************************
   * **************************************************************************************
   * ********************* DATA FUNCTIONS *************************************************
   * **************************************************************************************
   * **************************************************************************************
   */

   public getTechData(): any {
     const technologies = [];
     Object.keys(this.generationData[this.currentScenario.name]).forEach(tech => {
      technologies.push({name: tech, color: chartColors[tech]});
     });
     return technologies;
   }

  public getGenerationTotalForCurrentYear(technologies: string[]): number {
    let generationTotal = 0;
    try {
      technologies.forEach(tech => {
        this.generationData[this.currentScenario.name][tech].forEach(el => {
          if (el.year === this.currentYear) {
            generationTotal += el.value;
          }
        });
      });
    } catch (error) {
      console.log(error);
      console.log('error setting generation.');
    }
    return generationTotal;
  }

  public getCapacityTotalForCurrentYear(technologies: string[]): number {
    let capacityTotal = 0;
    technologies.forEach(tech => {
      this.capacityData[this.currentScenario.name][tech].forEach(el => {
        if (el.year === this.currentYear) {
          capacityTotal += el.value;
        }
      });
    });
    return capacityTotal;
  }

  public getCurtailmentTotalForCurrentYear(technologies: string[]): number {
    let curtailmentTotal = 0;
    technologies.forEach(tech => {
      this.curtailmentData[this.currentScenario.name][tech].forEach(el => {
        if (el.year === this.currentYear) {
          curtailmentTotal += el.value;
        }
      });
    });
    return curtailmentTotal;
  }

  /** Gets Generation Data
   * 
   */
  public getGenerationData(): Promise<any> {
    return new Promise((resolve, error) => {
      let generationData = {};
      d3.csv(this.currentPlan.data.generationPath, (data) => {
        data.forEach(element => {
          const year = element.year;
          const technology = element.technology;
          const value = element.value;
          const scenario = element.scenario;
          if (!generationData.hasOwnProperty(scenario)) {
            generationData[scenario] = {};
          }
          if (!generationData[scenario].hasOwnProperty(technology)) {
            generationData[scenario][technology] = [];
          }
          generationData[scenario][technology].push({ year: Number(year), value: Number(value) });
        });
        return resolve(generationData);
      });
    });
  }

  /** Gets Curtailment Data
   * 
   */
  public getCurtailmentData(): Promise<any> {
    this.curtailmentData = {};
    return new Promise((resolve, error) => {
      d3.csv(this.currentPlan.data.curtailmentPath, (data) => {
        data.forEach(element => {
          const year = element.year;
          const technology = element.technology;
          const value = element.value;
          const scenario = element.scenario;
          if (!this.curtailmentData.hasOwnProperty(scenario)) {
            this.curtailmentData[scenario] = {};
          }
          if (!this.curtailmentData[scenario].hasOwnProperty(technology)) {
            this.curtailmentData[scenario][technology] = [];
          }
          this.curtailmentData[scenario][technology].push({ year: Number(year), value: Number(value) });
        });
        return resolve(this.curtailmentData);
      });

    });
  }

  /** Gets Capacity Data */
  public getCapacityData(): Promise<any> {
    return new Promise((resolve, error) => {
      this.capacityData = {};
      d3.csv(this.currentPlan.data.capacityPath, (data) => {
        data.forEach(element => {
          const year = element.year;
          const technology = element.technology;
          const value = element.value;
          const scenario = element.scenario;
          if (!this.capacityData.hasOwnProperty(scenario)) {
            this.capacityData[scenario] = {};
          }
          if (!this.capacityData[scenario].hasOwnProperty(technology)) {
            this.capacityData[scenario][technology] = [];
          }
          this.capacityData[scenario][technology].push({ year: Number(year), value: Number(value) });
        });
        return resolve(this.capacityData);

      });
    });
  }

  /******************* GETTERS AND SETTERS **************/

  /** Sets the main Variable.  If this is true, this plan service runs
   * the main map.  If it is false, it runs the UI.
   * @param main true if map, false if UI
   */
  public setMain(main: boolean): void {
    this.isMain = main;
  }

  /** Gets the main variable.  
   * @return true if is map service, false if is ui service.
   */
  public getMain(): boolean {
    return this.isMain;
  }

  /** Gets the currently active plan
   * @return the current plan
   */
  public getCurrentPlan(): Plan {
    return this.currentPlan;
  }

  public getScenarioNameFromDisplayName(displayName: string): string {
    let name = this.currentScenario.name;
    this.scenarios.forEach(scenario => {
      if (displayName == scenario.displayName) {
        name = scenario.name;
      }
    });
    return name;
  }

  /** Gets all plans
   * @return array of all plans
   */
  public getPlans(): Plan[] {
    return this.plans;
  }

  /** Gets the current Year
   * @return the current year
   */
  public getCurrentYear(): number {
    return this.currentYear;
  }

  /** Gets the current scenario
   * @return the current scenario
   */
  public getCurrentScenario(): Scenario {
    return this.currentScenario;
  }

  /** Gets all scenarios
   * @return array holding all scenarios
   */
  public getScenarios(): Scenario[] {
    return this.scenarios;
  }

  /** Gets the active layers
   * @return the array of active layers.
   */
  public getLayers(): MapLayer[] {
    return this.layers;
  }

  /** Sets the state of the machine.  Resets the plan when returning to landing.
 * @param state the new machine state.
 */
  public setState(state): void {
    this.state = state;
    if (this.state === 'landing') {
      this.resetPlan();
    }
  }

  /** Gets the state of the machine
   * @return the current state.
   */
  public getState(): string {
    return this.state;
  }

  /** Gets the current CSS styles for the legend based on the currently selected
   * plan.
   * @return object containing key value pairs for the legend styles.
   */
  public getCss(): any {
    return this.currentPlan.css;
  }

  /************** Data Manipulation Functions *****************
   ************************************************************/

  /** Increments the current year by 1 and plays a sound */
  public incrementCurrentYear(): number {
    try {
      if (this.currentYear < this.currentPlan.maxYear) {
        this.currentYear++;
        this.soundsService.playClick();
      }
      this.yearSubject.next(this.currentYear);

    } catch (error) {
      // Catch error when setting up
    }
    return this.currentYear;
  }

  /** Decrements the current year by 1 and plays a sound */
  public decrementCurrentYear(): number {
    try {
      if (this.currentYear > this.currentPlan.minYear) {
        this.currentYear--;
        this.soundsService.playClick();
      }
      this.yearSubject.next(this.currentYear);
    } catch (error) {
      // catch error when setting up
    }
    return this.currentYear;
  }

  /** Sets the year to a specific value
   * @param year the year to set
   */
  public setCurrentYear(year): number {
    if (year >= this.currentPlan.minYear && year <= this.currentPlan.maxYear) {
      this.currentYear = year;
    }
    this.yearSubject.next(this.currentYear);
    return this.currentYear;
  }

  public setScenario(scenarioName: string): void {
    let scenario = null;
    this.scenarios.forEach(s => {
      if (s.name === scenarioName) {
        this.currentScenario = s;
      }
    });
    this.scenarioSubject.next(this.currentScenario);
    this.yearSubject.next(this.currentYear);
    this.soundsService.playTick();
  }

  /** Advances to the next scenario */
  public incrementScenario(): void {
    const index = this.scenarios.indexOf(this.currentScenario) + 1;
    this.currentScenario = this.scenarios[(index) % this.scenarios.length];
    this.scenarioSubject.next(this.currentScenario);
    this.soundsService.playTick();
  }

  /** Goes to the previous scenario */
  public decrementScenario(): void {
    let index = this.scenarios.indexOf(this.currentScenario) - 1;
    if (index === -1) {
      index = this.scenarios.length - 1;
    }
    this.currentScenario = this.scenarios[(index) % this.scenarios.length];
    this.scenarioSubject.next(this.currentScenario);
    this.soundsService.playTick();
  }

  /** Cycles backwards through layers */
  public decrementNextLayer() {
    let index = this.layers.indexOf(this.selectedLayer) - 1;
    if (index === -1) {
      index = this.layers.length - 1;
    }
    this.selectedLayer = this.layers[(index) % this.layers.length];
    this.selectedLayerSubject.next(this.selectedLayer);
    this.layerChangeSubject.next('decrement');
    this.soundsService.playTick();

  }

  /** Cycles forwards through layers */
  public incrementNextLayer() {
    const index = this.layers.indexOf(this.selectedLayer) + 1;
    this.selectedLayer = this.layers[(index) % this.layers.length];
    this.selectedLayerSubject.next(this.selectedLayer);
    this.layerChangeSubject.next('increment');
    this.soundsService.playTick();
  }

  /** Adds or removes the selected layer after checking it's active state. */
  public toggleLayer(): void {
    this.selectedLayer.active ? this.removeLayer() : this.addLayer();
    this.windowService.sendMessage({layer: this.selectedLayer.name, add: this.selectedLayer.active});
  }

  /** Adds or removes the selected layer after checking it's active state. */
  public toggleSelectedLayer(layerName: string): void {
    this.layers.forEach(e => {
      if (e.name === layerName) {
        this.selectedLayer = e;
      }
    });
    this.toggleLayer();
  }

  /** Adds a layer to the map
   * @return true if successful, false if not.
   */
  public addLayer(): boolean {
    const layer = this.selectedLayer;
    if (!layer.active) {
      layer.active = true;
      this.toggleLayerSubject.next(layer);
      if (this.isMain) {
        this.soundsService.playUp();
      }
      return true;
    } else {
      return false;
    }
  }

  /** Removes a layer from the table
   * @return true if successful, false if not
   */
  public removeLayer(): boolean {
    const layer = this.selectedLayer;
    if (layer.active) {
      layer.active = false;
      this.toggleLayerSubject.next(layer);
      if (this.isMain) {
        this.soundsService.playDown();
      }
      return true;
    } else {
      return false;
    }
  }

  /** Gets the currently selected layer
   * @return the currently selected layer.
   *    */
  public getSelectedLayer(): MapLayer {
    return this.selectedLayer;
  }

  /** When returning from the main map to the landing, all layer data for the plan 
   * needs to be reset.
   */
  public resetPlan() {
    this.currentPlan.map.mapLayers.forEach(layer => layer.active = false);
    this.currentYear = this.currentPlan.minYear;
    this.yearSubject.next(this.currentYear);
    this.layers = [];
    this.resetLayersSubject.next(this.layers);
  }

  /** Gets the class name of the correct legend css to display.
   * @return the current legend classname
   */
  public getCurrentLegendLayout(): string {
    return this.legendLayouts[this.currentLegendLayout];
  }

  /** Cycles to the next legend css classname.
   * @return the current css class name.
   */
  public changeCurrentLegendLayout() {
    this.currentLegendLayout = (this.currentLegendLayout + 1) % this.legendLayouts.length;
    this.legendSubject.next(this.getCurrentLegendLayout());
  }

  /** Map Construction Functions */
  /** Gets the scale of the map
   * @return the scale of the map
   */
  public getMapScale(): number {
    try {
      return this.currentMap.scale;
    } catch (error) {
      console.log('No Map Selected');
      return 0;
    }
  }

  /** Map Construction Functions */
  /** Gets the scale of the map
   * @return the scale of the map
   */
  public getMiniMapScale(): number {
    try {
      return this.currentMap.miniMapScale;
    } catch (error) {
      console.log('No Map Selected');
      return 0;
    }
  }

  /** Gets the map Image width
   * @return the map image width
   */
  public getMapImageWidth(): number {
    try {
      return this.currentMap.width;
    } catch (error) {
      console.log('No Map Selected');
      return 0;
    }
  }

  /** Get the map Image height
   * @return the map Image height
   */
  public getMapImageHeight(): number {
    try {
      return this.currentMap.height;
    } catch (error) {
      console.log('No Map Selected');
      return 0;
    }

  }

  /** Gets the map bounds
   * @return array of bounds.
   */
  public getMapBounds(): any[] {
    try {
      return this.currentMap.bounds;
    } catch (error) {
      console.log('No Map Selected');
      return [];
    }

  }

  /** Gets the map image name
   * @return the path to the map Image
   */
  public getBaseMapPath(): string {
    try {
      return this.currentMap.baseMapPath;
    } catch (error) {
      console.log('No Map Selected');
      return '';
    }
  }

  /** Gets the minimum Year
   * @return the minimum year for the plan
   */
  public getMinimumYear(): number {
    return this.currentPlan.minYear;
  }

  /** Gets the maximum Year
   * @return the maximum year for the plan
   */
  public getMaximumYear(): number {
    return this.currentPlan.maxYear;
  }

  public getScrollingMenuData(type: string) {
    if (type === 'year') {
      this.scrollingMenuSubject.next({type: type, data: this.getYears()});
    } else if (type === 'scenario') {
      this.scrollingMenuSubject.next({type: type, data: this.getScenarioNames()});
    }
  }

  private getYears() {
    const arr = [];
    for (let i = this.currentPlan.minYear; i <= this.currentPlan.maxYear; i++) {
      arr.push(i);
    }
    return arr;
  }

  private getScenarioNames() {
    const arr = [];
    for (let i = 0; i < this.scenarios.length; i++) {
      arr.push(this.scenarios[i].displayName);
    }
    return arr;
  }
}
