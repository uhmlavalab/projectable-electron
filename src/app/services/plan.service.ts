import { Injectable } from '@angular/core';
import { Plan } from '@app/interfaces/plan';
import { Plans } from '../../assets/plans/plans';
import { Scenario } from '@app/interfaces';
import { BehaviorSubject} from 'rxjs';
import { chartColors } from '../../assets/plans/defaultColors';
import { SoundsService } from '@app/sounds';
import * as d3 from 'd3/d3.min';
import { WindowService } from '@app/modules/window';

@Injectable({
  providedIn: 'root'
})
export class PlanService {

  private plans: Plan[]; // Array holding all plans (memory is cleared when plan is set.)

  public planSetSubject = new BehaviorSubject<boolean>(null); // Tells components when the plan is set.
  public toggleLayerSubject = new BehaviorSubject<any>(null);      // Pubisher for when a layer is toggled
  public layersSubject = new BehaviorSubject<any[]>(null);
  public scrollingMenuSubject = new BehaviorSubject<any>(null);
  // Array Holding All Plans
  public planSubject = new BehaviorSubject<Plan>(null);     // Plan Publisher

  public scenarioSubject = new BehaviorSubject<Scenario>(null); // Scenario publisher
  public scenarioListSubject = new BehaviorSubject<any[]>(null);
  // Current year
  public yearSubject = new BehaviorSubject<number>(null);   // Year Publisher
  public yearsSubject = new BehaviorSubject<number[]>(null);

  public technologySubject = new BehaviorSubject<any>(null);

  private dataTable: any;

  constructor(private soundsService: SoundsService, private windowService: WindowService) {
    this.dataTable = {
      state: 0,
      plan: {
        current: null,
        isSet: false,
        name: ''
      },
      map: {
        scale: 0,
        miniScale: 0,
        width: 0,
        height: 0, 
        bounds: null,
        path: ''
      },
      year: {
        all: [],
        current: 0,
        max: 0,
        min: 0,
      },
      scenario: {
        all: [],
        current: null,
        name: '',
        display: '',
        currentIndex: 0
      },
      yearMenu: {
        state: 0,
      },
      layers: {
        all: []
      },
      components: {
        all: [],
      },
      controls: {
        keyboard: true,
        touch: true,
        pucks: false
      },
      data: {
        generationPath: null,
        curtailmentPath: null,
        capacityPath: null,
        generation: null,
        capacity: null,
        curtailment: null,
        tech: null
      }
    };

    this.plans = Plans;
  }

  /* Start The Map */
  public startTheMap(plan: Plan): void {
    this.setupSelectedPlan(this.plans.find(el => plan.name === el.name));
    this.plans = [];  // Free Up the memory.
    this.setState(1);
    this.windowService.sendMessage({ type: 'state', message: 'run', plan: plan });
  }

  /** Sets Up the Current Plan
   * @param plan The plan to set up
   */
  public setupSelectedPlan(plan: Plan): void {
    this.dataTable.plan.current = plan;
    this.dataTable.plan.name = plan.name;
    this.dataTable.plan.isSet = true;

    plan.map.mapLayers.forEach(layer => {
      this.dataTable.layers.all.push({ layer: layer, state: 0 });
    });

    this.dataTable.map.scale = plan.map.scale;
    this.dataTable.map.miniScale = plan.map.miniMapScale;
    this.dataTable.map.width = plan.map.width;
    this.dataTable.map.height = plan.map.height;
    this.dataTable.map.bounds = plan.map.bounds;
    this.dataTable.map.path = plan.map.baseMapPath;
    this.dataTable.year.min = plan.minYear;  // Begin with the lowest allowed year.
    this.dataTable.year.max = plan.maxYear;  // Begin with the lowest allowed year.
    this.dataTable.scenario.all = plan.scenarios;  // Load array with all scenarios associated with this plan
    this.dataTable.scenario.name = plan.scenarios[0].name;
    this.dataTable.scenario.display = plan.scenarios[0].displayName;
    this.dataTable.scenario.currentIndex = 0;
    this.dataTable.components.all = ['map', 'pie', 'line'];
    this.dataTable.data.generationPath = plan.data.generationPath;
    this.dataTable.data.curtailmentPath = plan.data.curtailmentPath;
    this.dataTable.data.Path = plan.data.generationPath;

    if (this.loadAllData()) {
      this.publishSetupData();
    }
  }

  private publishSetupData(): void {
    this.planSetSubject.next(this.dataTable.plan.isSet);
    this.yearSubject.next(this.dataTable.year.current);      // Publish current year
    this.yearsSubject.next(this.getYears());
    this.scenarioListSubject.next(this.dataTable.scenario.all); // Publish a list of scenarios.
    this.scenarioSubject.next(this.dataTable.scenario.all[this.dataTable.scenario.currentIndex]); // Publish current scenario
  }

  /****************************************************************************************
   * **************************************************************************************
   * ********************* DATA FUNCTIONS *************************************************
   * **************************************************************************************
   * **************************************************************************************
   */
  public loadAllData(): boolean {
    // Load All Plan Data
    try {
      this.getCapacityData().then(capData => this.dataTable.data.capacity = capData);
      this.getGenerationData().then(genData => this.dataTable.data.generation = genData);
      this.getCurtailmentData().then(curData => this.dataTable.data.curtailment = curData);
      this.dataTable.data.tech = this.getTechData();
      return true;
    } catch (error) {
      console.log(error);
      console.log('failed to get all data during setup');
      return false;
    }
  }

  public getTechData(): any {
    const technologies = [];
    Object.keys(this.dataTable.data.generation[this.dataTable.plan.name]).forEach(tech => {
      technologies.push({ name: tech, color: chartColors[tech] });
    });
    return technologies;
  }

  public getGenerationTotalForCurrentYear(technologies: string[]): number {
    let generationTotal = 0;
    try {
      technologies.forEach(tech => {
        this.dataTable.data.generation[this.dataTable.scenario.name][tech].forEach(el => {
          if (el.year === this.dataTable.year.current) {
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
      this.dataTable.data.capactiy[this.dataTable.scenario.name][tech].forEach(el => {
        if (el.year === this.dataTable.year.current) {
          capacityTotal += el.value;
        }
      });
    });
    return capacityTotal;
  }

  public getCurtailmentTotalForCurrentYear(technologies: string[]): number {
    let curtailmentTotal = 0;
    technologies.forEach(tech => {
      this.dataTable.data.curtailment[this.dataTable.scenario.name][tech].forEach(el => {
        if (el.year === this.dataTable.year.current) {
          curtailmentTotal += el.value;
        }
      });
    });
    return curtailmentTotal;
  }

  /** Gets Generation Data */
  public getGenerationData(): Promise<any> {
    return new Promise((resolve, error) => {
      const generationData = {};
      d3.csv(this.dataTable.data.generationPath, data => {
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

  /** Gets Curtailment Data */
  public getCurtailmentData(): Promise<any> {
    const curtailmentData = {};
    return new Promise((resolve, error) => {
      d3.csv(this.dataTable.data.curtailmentPath, (data) => {
        data.forEach(element => {
          const year = element.year;
          const technology = element.technology;
          const value = element.value;
          const scenario = element.scenario;
          if (!curtailmentData.hasOwnProperty(scenario)) {
            curtailmentData[scenario] = {};
          }
          if (!curtailmentData[scenario].hasOwnProperty(technology)) {
            curtailmentData[scenario][technology] = [];
          }
          curtailmentData[scenario][technology].push({ year: Number(year), value: Number(value) });
        });
        return resolve(curtailmentData);
      });

    });
  }

  /** Gets Capacity Data */
  public getCapacityData(): Promise<any> {
    return new Promise((resolve, error) => {
      const capacityData = {};
      d3.csv(this.dataTable.data.capacityPath, data => {
        data.forEach(element => {
          const year = element.year;
          const technology = element.technology;
          const value = element.value;
          const scenario = element.scenario;
          if (!capacityData.hasOwnProperty(scenario)) {
            capacityData[scenario] = {};
          }
          if (!capacityData[scenario].hasOwnProperty(technology)) {
            capacityData[scenario][technology] = [];
          }
          capacityData[scenario][technology].push({ year: Number(year), value: Number(value) });
        });
        return resolve(capacityData);
      });
    });
  }

  /******************* GETTERS AND SETTERS **************/

  /** Sets the state of the machine.  Resets the plan when returning to landing.
 * @param state the new machine state.
 */
  public setState(state): void {
    this.dataTable.state = state;
    if (state === 0) {
      this.resetPlan();
    }
  }

  /************** Data Manipulation Functions *****************
   ************************************************************/

  /** Increments the current year by 1 and plays a sound */
  public incrementCurrentYear(): void {
    try {
      if (this.dataTable.year.current < this.dataTable.year.max) {
        this.dataTable.year.current++;
        this.soundsService.playClick();
        this.yearSubject.next(this.dataTable.year.current);
        // MESSAGE
      }
    } catch (error) {
      console.log('failed to increment current year');
    }
  }

  /** Decrements the current year by 1 and plays a sound */
  public decrementCurrentYear(): void {
    try {
      if (this.dataTable.year.current > this.dataTable.year.min) {
        this.dataTable.year.current--;
        this.soundsService.playClick();
        // MESSAGE
      }
      this.yearSubject.next(this.dataTable.year.current);
    } catch (error) {
      console.log('failed to decrement current year');
    }
  }

  /** Sets the year to a specific value
   * @param year the year to set
   */
  public updateYear(year): void {
    if (this.yearIsValid(year) && this.dataTable.year.current !== year) {
      this.dataTable.year.current = year;
      this.yearSubject.next(year);
      // MESSAGE
    }
  }

  private yearIsValid(year: number): boolean {
    return year >= this.dataTable.year.min && year <= this.dataTable.year.max;
  }

  public updateScenario(scenarioName: string): void {
    if (scenarioName !== this.dataTable.scenario.name) {
      const scenario = this.dataTable.scenarios.all.find(s => s.name === scenarioName);
      if (scenario) {
        const index = this.dataTable.scenario.all.indexOf(scenario);
        this.dataTable.scenario.currentIndex = index;
        this.dataTable.scenario.name = scenario.name;
        this.dataTable.scenario.display = scenario.displayName;
        this.scenarioSubject.next(scenario);
        this.yearSubject.next(this.dataTable.year.current);
        this.soundsService.playTick();
        // MESSAGE
      }
    }
  }

  /** Adds or removes the selected layer after checking it's active state. */
  public toggleLayer(layer): void {
    const el = this.dataTable.layers.all.find(e => e.name === layer);
    if (el) {
      el.status = 1 - el.status;
      this.toggleLayerSubject.next({ layer: el.name, status: el.status });
      this.windowService.sendMessage({ layer: el.name });
      el.status === 0 ? this.soundsService.playDown() : this.soundsService.playUp();
    }
  }

  /** When returning from the main map to the landing, all layer data for the plan
   * needs to be reset.
   */
  public resetPlan() {
    // RESET PLAN
  }

  /** Map Construction Functions */
  /** Gets the scale of the map
   * @return the scale of the map
   */
  public getMapData(): any {
    return {
      scale: this.dataTable.map.scale,
      miniScale: this.dataTable.map.miniScale,
      width: this.dataTable.map.width,
      height: this.dataTable.map.height,
      bounds: this.dataTable.map.bounds,
      path: this.dataTable.map.path
    };
  }

  public getScrollingMenuData(type: string) {
    if (type === 'year') {
      this.scrollingMenuSubject.next({ type: type, data: this.getYears() });
    } else if (type === 'scenario') {
      this.scrollingMenuSubject.next({ type: type, data: this.dataTable.scenario.all});
    }
  }

  private getYears() {
    const arr = [];
    for (let i = this.dataTable.year.min; i <= this.dataTable.max; i++) {
      arr.push(i);
    }
    return arr;
  }
}