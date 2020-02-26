import { Injectable } from '@angular/core';
import { Plan } from '@app/interfaces/plan';
import { Plans } from '../../assets/plans/plans';
import { Scenario } from '@app/interfaces';
import { BehaviorSubject } from 'rxjs';
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
  public allPlansSubject = new BehaviorSubject<Plan[]>(null);

  public scenarioSubject = new BehaviorSubject<Scenario>(null); // Scenario publisher
  public scenarioListSubject = new BehaviorSubject<any[]>(null);
  // Current year
  public yearSubject = new BehaviorSubject<number>(null);   // Year Publisher
  public yearsSubject = new BehaviorSubject<number[]>(null);

  /* Data Subjects */
  public capDataSubject = new BehaviorSubject<any>(null);
  public genDataSubject = new BehaviorSubject<any>(null);
  public curDataSubject = new BehaviorSubject<any>(null);
  public technologySubject = new BehaviorSubject<any>(null);
  public precentRenewableByYearSubject = new BehaviorSubject<number>(null);

  public positionSubject = new BehaviorSubject<any>(null);
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
        currentRenewablePercent: 0,
        max: 0,
        min: 0,
      },
      renewableTotals: [],
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
    this.allPlansSubject.next(this.plans);
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
    this.dataTable.year.min = plan.minYear;
    this.dataTable.year.max = plan.maxYear;
    this.dataTable.year.current = plan.minYear;
    this.dataTable.scenario.all = plan.scenarios;  // Load array with all scenarios associated with this plan
    this.dataTable.scenario.name = plan.scenarios[0].name;
    this.dataTable.scenario.display = plan.scenarios[0].displayName;
    this.dataTable.scenario.currentIndex = 0;
    this.dataTable.components.all = ['map', 'pie', 'line'];
    this.dataTable.data.generationPath = plan.data.generationPath;
    this.dataTable.data.curtailmentPath = plan.data.curtailmentPath;
    this.dataTable.data.capacityPath = plan.data.capacityPath;
    this.publishSetupData();
    this.loadAllData();
  }

  private publishSetupData(): void {
    this.planSetSubject.next(this.dataTable.plan.isSet);
    this.yearSubject.next(this.dataTable.year.current);      // Publish current year
    this.yearsSubject.next(this.getYears());
    this.scenarioListSubject.next(this.dataTable.scenario.all); // Publish a list of scenarios.
    this.scenarioSubject.next(this.dataTable.scenario.all[this.dataTable.scenario.currentIndex]); // Publish current scenario
    this.layersSubject.next(this.dataTable.layers.all);
    this.publishScrollingMenuData();
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
      this.getCapacityData().then(capData => {
        this.dataTable.data.capacity = capData;
        this.capDataSubject.next(capData);
      });

      this.getGenerationData().then(genData => {
        this.dataTable.data.generation = genData;
        this.dataTable.data.tech = this.getTechData(genData);
        this.genDataSubject.next(genData);
        this.technologySubject.next(this.dataTable.data.tech);
      });

      this.getCurtailmentData().then(curData => {
        this.dataTable.data.curtailment = curData;
        this.curDataSubject.next(curData);
      });

      return true;
    } catch (error) {
      console.log(error);
      console.log('failed to get all data during setup');
      return false;
    }
  }

  private getTechData(data): any {
    const technologies = [];
    Object.keys(data[this.dataTable.scenario.name]).forEach(tech => {
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
      this.dataTable.data.capacity[this.dataTable.scenario.name][tech].forEach(el => {
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
  private getGenerationData(): Promise<any> {
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
  private getCurtailmentData(): Promise<any> {
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
  private getCapacityData(): Promise<any> {
    return new Promise((resolve, error) => {
      const capacityData = {};
      console.log(this.dataTable.data.capacityPath);
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
        if (this.windowService.isMain()) {
          this.soundsService.playClick();
        }
        this.yearSubject.next(this.dataTable.year.current);
        this.precentRenewableByYearSubject.next(this.setCurrentPercent(this.dataTable.year.current));
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
        if (this.windowService.isMain()) {
          this.soundsService.playClick();
        }
        // MESSAGE
      }
      this.yearSubject.next(this.dataTable.year.current);
      this.precentRenewableByYearSubject.next(this.setCurrentPercent(this.dataTable.year.current));
    } catch (error) {
      console.log('failed to decrement current year');
    }
  }

  /** Sets the year to a specific value
   * @param year the year to set
   */
  public updateYear(val): void {
    let year = val;
    if (typeof(year) === 'string') {
      year = parseInt(year, 10);
    }
    if (this.yearIsValid(year) && this.dataTable.year.current !== year) {
      this.dataTable.year.current = year;
      this.yearSubject.next(year);
      this.precentRenewableByYearSubject.next(this.setCurrentPercent(year));
      if (this.windowService.isMain()) {
        this.soundsService.playClick();
        this.windowService.sendMessage({ type: 'year change',  message: year });
      }
    }
  }

  private setCurrentPercent(year: number): number {
    this.dataTable.renewableTotals.forEach(e => {
      if (e.year == year) {
        this.dataTable.year.currentRenewablePercent = e.total;
      }
    });
    return this.dataTable.year.currentRenewablePercent;
  }
  private yearIsValid(year: number): boolean {
    return year >= this.dataTable.year.min && year <= this.dataTable.year.max;
  }

  public updateScenario(scenarioName: string): void {
    if (scenarioName !== this.dataTable.scenario.name) {
      const scenario = this.dataTable.scenario.all.find(s => s.name == scenarioName);
      if (scenario) {
        const index = this.dataTable.scenario.all.indexOf(scenario);
        this.dataTable.scenario.currentIndex = index;
        this.dataTable.scenario.name = scenario.name;
        this.dataTable.scenario.display = scenario.displayName;
        this.scenarioSubject.next(scenario);
        this.yearSubject.next(this.dataTable.year.current);
        this.precentRenewableByYearSubject.next(this.setCurrentPercent(this.dataTable.year.current));
        if (this.windowService.isMain()) {
          this.soundsService.playTick();
        }
      }
    }
  }

  /** Adds or removes the selected layer after checking it's active state. */
  public toggleLayer(layer: string): void {
    let el = null;
    this.dataTable.layers.all.forEach(e => {
      if (e.layer.name === layer) {
        el = e;
      }
    });
    if (el) {
      el.state = 1 - el.state;
      this.toggleLayerSubject.next(el);
      if (this.windowService.isMain()) {
        el.state === 0 ? this.soundsService.playDown() : this.soundsService.playUp();
      }
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

  private publishScrollingMenuData(): void {
    this.scrollingMenuSubject.next([
      { type: 'year', data: this.getYears() },
      { type: 'scenario', data: this.getScenarioNames() }
    ]);
  }

  private getYears(): number[] {
    const arr = [];
    for (let i = this.dataTable.year.min; i <= this.dataTable.year.max; i++) {
      arr.push(i);
    }
    return arr;
  }

  private getScenarioNames(): string[] {
    const arr = [];
    this.dataTable.scenario.all.forEach(s => arr.push(s.displayName));
    return arr;
  }

  public getCurrentYear(): number {
    return this.dataTable.year;
  }

  public getAllPlans(): Plan[] {
    return this.plans;
  }

  /** The scrollable menu passes data and type to this function and the UI and Map
 * are notified of the change.
 * @param type the type of change
 * @param data the value of the change.
 */
  public handleMenuChange(type: string, data: any): void {
    if (type === 'year') {
      this.updateYear(data);
    } else if (type === 'scenario') {
      const scen = this.dataTable.scenario.all.find(el => el.displayName === data);
      this.updateScenario(scen.name);
      this.windowService.sendMessage({ type: 'scenario change', message: scen.name });
    }
  }

  public handleMessage(msg: any): boolean {
    if (msg.type === 'year change') {
      this.updateYear(msg.message);
    } else if (msg.type === 'scenario change') {
      this.updateScenario(this.dataTable.scenario.all.find(el => el.name === msg.message).name);
    } else if (msg.type === 'toggle layer') {
      this.toggleLayer(msg.message);
    } else if (msg.type === 'position elements' && !this.windowService.isMain()) {
      this.positionSubject.next(msg.message);
    }
    return true;
  }

  public handleLayerButtonClick(layerName: string) {
    this.toggleLayer(layerName);
    this.windowService.sendMessage({type: 'toggle layer', message: layerName });
  }

  public positionMapElements(id: string, x: number, y: number) {
    const msg = {
      id: id,
      x: x,
      y: y
    };
    this.windowService.sendMessage({type: 'position elements', message: msg});
  }

  public updateTotal(total: number, year: number): void {
    this.dataTable.renewableTotals.push({year: year, total: total});
  }

  public finishedYearBarSetup(): void {
    this.precentRenewableByYearSubject.next(this.setCurrentPercent(this.dataTable.year.current));
  }
}