import { Injectable } from '@angular/core';
import { Plan } from '@app/interfaces/plan';
import { Plans } from '../../assets/plans/plans';
import { Scenario } from '@app/interfaces';
import { BehaviorSubject } from 'rxjs';
import { chartColors } from '../../assets/plans/defaultColors';
import { SoundsService } from '@app/sounds';
import * as d3 from 'd3/d3.min';
import { WindowService } from '@app/modules/window';
import { DataTable } from '@app/interfaces/data-table';
import { Message } from '@angular/compiler/src/i18n/i18n_ast';

@Injectable({
  providedIn: 'root'
})
export class PlanService {

  private dataTable: DataTable; // This variable holds all active data.
  private CSS: any;       // Holds the css data for the positioning of the charts and map objects.
  private plans: Plan[];  // Array holding all plans (memory is cleared when plan is set.
  private elements: {category: string, tag: string}[];

  // Data publishers.
  public planSetSubject = new BehaviorSubject<boolean>(null);          // Tells components when the plan is set.
  public toggleLayerSubject = new BehaviorSubject<any>(null);          // Pubisher for when a layer is toggled
  public layersSubject = new BehaviorSubject<any[]>(null);             // Publishes array of all Layers.
  public layerInfoSubject = new BehaviorSubject<any>(null);            // Publishes the data for the layer info component.
  public scrollingMenuSubject = new BehaviorSubject<any>(null);        // Publishes the data used to populate the menus. (scenario, year).
  public scenarioSubject = new BehaviorSubject<Scenario>(null);        // Scenario publisher
  public scenarioListSubject = new BehaviorSubject<Scenario[]>(null);  // Publishes an array of all scenarios.
  public yearSubject = new BehaviorSubject<number>(null);              // Published the current year data.
  public yearsSubject = new BehaviorSubject<number[]>(null);           // Publishes an array of all years.
  public precentRenewableByYearSubject = new BehaviorSubject<number>(null); // Publishes the percent renewable for a single year.
  public positionSubject = new BehaviorSubject<any>(null);             // Publishes the repositioning data from the position modal.
  public resizeSubject = new BehaviorSubject<any>(null);               // Publishes the resizing data from the position modal.
  public closeModalSubject = new BehaviorSubject<any>(null);           // Notifies the position modal to close.
  public revertPositionsSubject = new BehaviorSubject<any>(null);      // Reverts repositioning on the map screen when changes are canceled.
  public capDataSubject = new BehaviorSubject<any>(null);              // Publishes capacity data.
  public genDataSubject = new BehaviorSubject<any>(null);              // Publishes the generation data.
  public curDataSubject = new BehaviorSubject<any>(null);              // Puslishes the curtailment data.
  public technologySubject = new BehaviorSubject<any>(null);           // Publishes an array of all technologies and their colors.
  public cssSubject = new BehaviorSubject<any>(null);                  // Publishes the css data.
  public tooltipSubject = new BehaviorSubject<any>(null);              // Publishes the which tooltip to display.

  constructor(private soundsService: SoundsService, private windowService: WindowService) {
    this.elements = [
      {category: null, tag: 'map'},
      {category: null, tag: 'data'},
      {category: 'charts', tag: 'line'},
      {category: 'charts', tag: 'pie'},
      {category: 'logos', tag: 'lava'},
      {category: 'logos', tag: 'heco'}
  ];

    // The dataTable stores all relevant data and can be printed to the console using the function printDataTable().
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

      layers: {
        all: []
      },
      components: [],
      data: {
        generationPath: null,
        curtailmentPath: null,
        capacityPath: null,
        generation: null,
        capacity: null,
        curtailment: null,
        tech: null
      },
      positionData: {
        locations: {},
        percents: {
          lava: -1,
          map: -1,
          pie: -1,
          heco: -1,
          displayData: -1
        }
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
    // Store all layers into an array.
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
    this.dataTable.components = ['map', 'pie', 'line'];
    this.dataTable.data.generationPath = plan.data.generationPath;
    this.dataTable.data.curtailmentPath = plan.data.curtailmentPath;
    this.dataTable.data.capacityPath = plan.data.capacityPath;
    this.publishSetupData();
    this.loadAllData();
  }

  /** Once all of the data is properly initialized, this function will publish the data. */
  private publishSetupData(): void {
    this.planSetSubject.next(this.dataTable.plan.isSet);     // Notify components that the plan is set.
    this.yearSubject.next(this.dataTable.year.current);      // Publish current year
    this.yearsSubject.next(this.getYears());                 // Publish the array of all years used in the application.
    this.scenarioListSubject.next(this.dataTable.scenario.all); // Publish a list of scenarios.
    this.scenarioSubject.next(this.dataTable.scenario.all[this.dataTable.scenario.currentIndex]); // Publish current scenario
    this.layersSubject.next(this.dataTable.layers.all);      // Publish all layers used in the application.
    this.publishScrollingMenuData();                         // Populate the scrolling menus.
  }

  /** Loads all data (Curtailment, Generation, Capacity) into the data table.
   * @return true if successful, false if failure.
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

  /** Sets the state of the machine.  Resets the plan when returning to landing.
 * @param state the new machine state.
 */
  public setState(state): void {
    this.dataTable.state = state;
    if (state === 0) {
      this.resetPlan();
    }
  }

  /** Sets the year to a specific value, plays the year change sound effect and messages the map screen.
   * @param year the year to set
   */
  public updateYear(val, play: boolean): void {
    const year = Number(val);  // Cast the year as a number if it isnt already.
    // Check to see if the year is valid and it is actually different than the current year.
    if (year >= this.dataTable.year.min && year <= this.dataTable.year.max && this.dataTable.year.current !== year) {
      this.dataTable.year.current = year;                                       // Set the current year in the data table.
      this.yearSubject.next(year);                                              // Publish new year.
      this.precentRenewableByYearSubject.next(this.setCurrentPercent(year));    // Publish current percentage data.
      if (this.windowService.isMain()) {
        if (play) {
          this.soundsService.playYear(val);
        }                                     // Play the sound once.
        this.windowService.sendMessage({ type: 'year change', message: year }); // Notify the Map screen of the year change.
        this.windowService.sendMessage({ type: 'percent change', message: this.dataTable.year.currentRenewablePercent });
      }
    } else {
      if (this.windowService.isMain()) {
        if (play) {
          this.soundsService.playYear(val);
        }
      }
    }
  }

  /** Sets the current percent of renewable for a specific year.
   * @param year the current year for the data.
   * @return the renewable percentage.
   */
  private setCurrentPercent(year: number): number {
    this.dataTable.renewableTotals.forEach(e => {
      if (e.year == year) {
        this.dataTable.year.currentRenewablePercent = e.total;
      }
    });
    return this.dataTable.year.currentRenewablePercent;
  }

  /** Updates the current scenario, plays the scenario change sound.
   * @param scenarioName the scenario name, not the scenario displayName.
   */
  public updateScenario(scenarioName: string): void {
    if (scenarioName !== this.dataTable.scenario.name) {           // Check to make sure the scenario is not already selected.
      const scenario = this.dataTable.scenario.all.find(s => s.name == scenarioName);  // Find the correct scenario in the datatable.
      if (scenario) {
        this.dataTable.scenario.currentIndex = this.dataTable.scenario.all.indexOf(scenario);  // Update the scenario index.
        this.dataTable.scenario.name = scenario.name;                                          // Update Scenario Name
        this.dataTable.scenario.display = scenario.displayName;                                // Update the Scenario display name.
        this.scenarioSubject.next(scenario);                                                   // Publish scenairo
        this.yearSubject.next(this.dataTable.year.current);                  // Force app to update data by resending year.
        this.precentRenewableByYearSubject.next(this.setCurrentPercent(this.dataTable.year.current));  // Update renewable precentage.
        if (this.windowService.isMain()) {
          this.soundsService.playScenario(scenarioName);
        }
      }
    }
  }

  /** Adds or removes the selected layer after flipping it's active state.
   * @param layer the name of the layer that will be toggled.  Need to find the correct layer.
  */
  public toggleLayer(layer: string): void {
    const el = this.dataTable.layers.all.find(e => e.layer.name === layer);
    if (el) {
      el.state = 1 - el.state;                       // Flip the state of the layer.
      this.toggleLayerSubject.next(el);              // Publish the layer toggle.
      if (this.windowService.isMain()) {
        el.state === 1 ? this.soundsService.playOn(el.layer.name) : this.soundsService.playOff(el.layer.name); // Play correct sound.
      }
    }
  }

  /** When returning from the main map to the landing, all layer data for the plan
   * needs to be reset.
   */
  public resetPlan() {
    // RESET PLAN
  }

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

  /** The scrollable menu passes data and type to this function and the UI and Map
 * are notified of the change.
 * @param type the type of change
 * @param data the value of the change.
 */
  public handleMenuChange(type: string, data: any, play: boolean): void {
    if (type === 'year') {
      this.updateYear(data, play);
    } else if (type === 'scenario') {
      const scen = this.dataTable.scenario.all.find(el => el.displayName === data);
      this.updateScenario(scen.name);
      this.windowService.sendMessage({ type: 'scenario change', message: scen.name });
    }
  }

  /** Messages are received by heco-main component and touch-ui component for the two windows.  The messages are sent
   * to this function to be parsed.
   * @param msg the message to be parsed.
   * @return true when finished.
   */
  public handleMessage(msg: any): boolean {
    if (msg.type === 'year change') {
      this.updateYear(msg.message, false);
    } else if (msg.type === 'percent change') {
      this.dataTable.year.currentRenewablePercent = msg.message;
      this.precentRenewableByYearSubject.next(msg.message);
    } else if (msg.type === 'scenario change') {
      this.updateScenario(this.dataTable.scenario.all.find(el => el.name === msg.message).name);
    } else if (msg.type === 'toggle layer') {
      this.toggleLayer(msg.message);
    } else if (msg.type === 'position elements' && !this.windowService.isMain()) {
      this.positionSubject.next(msg.message);
    } else if (msg.type === 'resize') {
      this.resizeSubject.next(msg.message);
      this.handleSliderChange(msg.message.percent, msg.message.id);
    } else if (msg.type === 'update height') {
      this.updateCSSHeight(msg.message.cat, msg.message.name, msg.message.height);
    } else if (msg.type === 'update width') {
      this.updateCSSWidth(msg.message.cat, msg.message.name, msg.message.width);
    } else if (msg.type === 'file information') {
      msg.message.forEach(d => {
        if (d.file === 'cssData') {
          if (d.css.charts && d.css.logos && d.css.map && d.css.data) {
            if (!this.windowService.isMain()) {
              this.setCSS(d.css);
              this.windowService.sendMessage({ type: 'css loaded', message: d.css });
            }
          } else {
            // Create New Css File
            this.createCssData();
          }
        }
      });
    } else if (msg.type === 'css loaded') {
      if (this.windowService.isMain()) {
        this.setCSS(msg.message);
      }
    } else if (msg.type === 'update cssData file') {
      if (!this.windowService.isMain() && msg.message.saveData) {
        this.storeCssData();
      } else if (!msg.message.saveData && !this.windowService.isMain()) {
        this.revertPositionsSubject.next(this.CSS);
        if (this.CSS.charts.line.percent && this.CSS.charts.line.percent > 0) {
          // tslint:disable-next-line: max-line-length
          this.resizeSubject.next({ id: 'resize line', width: this.CSS.charts.line.width, height: this.CSS.charts.line.height, percent: this.CSS.charts.line.percent });
        }
        if (this.CSS.map.percent && this.CSS.map.percent > 0) {
          // tslint:disable-next-line: max-line-length
          this.resizeSubject.next({ id: 'resize map', width: this.CSS.map.width, height: this.CSS.map.height, percent: this.CSS.map.percent });
        }
        if (this.CSS.charts.pie.percent && this.CSS.charts.pie.percent > 0) {
          // tslint:disable-next-line: max-line-length
          this.resizeSubject.next({ id: 'resize pie', width: this.CSS.charts.pie.width, height: this.CSS.charts.pie.height, percent: this.CSS.charts.pie.percent });
        }
      }
    }
    return true;
  }

  /** Toggles the selected layer and messages the other window.
   * @param layerName the name of the layer that was toggled.
   */
  public handleLayerButtonClick(layerName: string): void {
    this.toggleLayer(layerName);
    const msg = { type: 'toggle layer', message: layerName };
    this.windowService.sendMessage(msg);
  }

  public handleLayerButtonInfoClick(layerName: string) {
    let el = null;
    this.dataTable.layers.all.forEach(e => {
      if (e.layer.name === layerName) {
        el = e;
      }
    });
    if (el) {
      this.layerInfoSubject.next(el);
    }
  }

  /** When the user uses the modal to position the map elements the data is parsed here and sent to the
   * map window to adjust the position of the elements there.
   * @param id a string idenfifying the element to move. (ie. 'map', 'pie').
   * @param x the absolute x position in pixels.
   * @param y the absolute y position in pixels.
   * */
  public positionMapElements(id: string, x: number, y: number) {
    this.windowService.sendMessage({ type: 'position elements', message: { id: id, x: x, y: y } });
  }

  /** When the renewable totals are calculated y the year-bar component, the data is sent here to be stored in the datatable.
   * @param total the percentage of renewable energy.
   * @param year the year associated with the total.
   */
  public updateTotal(total: number, year: number): void {
    this.dataTable.renewableTotals.push({ year: year, total: total });
  }

  /** When all data is finished calculating, publis it. */
  public finishedYearBarSetup(): void {
    this.precentRenewableByYearSubject.next(this.setCurrentPercent(this.dataTable.year.current));
  }

  /** When the user finishes using the element position modal, they either click save or cancel.  If the user clicks save,
   * the css data file will be updated.  If they click cancel, it will simply close the modal component.
   * @param save true if user clicks save, false if the user clicks cancel.alert-danger
   */
  public closePositionModal(save: boolean) {
      this.windowService.sendMessage({ type: 'update cssData file', message: { saveData: save } });
      this.closeModalSubject.next({ saveData: save });
      if (this.windowService.isMain() && !save) {
        this.revertPositionsSubject.next(this.CSS);
      }
  }

  /** When the user uses the position modal to position map elements, the data changes are stored in the datatable.
   * @param data the id, x, y of the element being repositioned.
   */
  public updatePositionData(data) {
    this.dataTable.positionData.locations = data;
  }

  /** When the css file is loaded, the data is sent here to be stored and published so that elements can be positioned.
   * @param css the css data object.
   */
  private setCSS(css: any): void {
    this.CSS = css;
    this.cssSubject.next(this.CSS);
    if (!this.windowService.isMain()) {
      if (this.CSS.charts.line.percent && this.CSS.charts.line.percent > 0) {
        // tslint:disable-next-line: max-line-length
        this.resizeSubject.next({ id: 'resize line', width: this.CSS.charts.line.width, height: this.CSS.charts.line.height, percent: this.CSS.charts.line.percent });
      }

      if (this.CSS.map.percent && this.CSS.map.percent > 0) {
        // tslint:disable-next-line: max-line-length
        this.resizeSubject.next({ id: 'resize map', width: this.CSS.map.width, height: this.CSS.map.height, percent: this.CSS.map.percent });
      }

      if (this.CSS.charts.pie.percent && this.CSS.charts.pie.percent > 0) {
        // tslint:disable-next-line: max-line-length
        this.resizeSubject.next({ id: 'resize pie', width: this.CSS.charts.pie.width, height: this.CSS.charts.pie.height, percent: this.CSS.charts.pie.percent });
      }
    }


  }

  /** When the user uses the position modal to move map elements around, the data can be saved to a file.  This function
   * saves that data and writes a file.  The data is saved in the positionData section of the dataTable.
   */
  private storeCssData(): void {
    if (this.dataTable.positionData.locations.line.x) {
      this.CSS.charts.line.left = `${this.dataTable.positionData.locations.line.x}px`;
      this.CSS.charts.line.top = `${this.dataTable.positionData.locations.line.y}px`;
    }
    if (this.dataTable.positionData.locations.pie.x) {
      this.CSS.charts.pie.left = `${this.dataTable.positionData.locations.pie.x}px`;
      this.CSS.charts.pie.top = `${this.dataTable.positionData.locations.pie.y}px`;
    }
    if (this.dataTable.positionData.locations.map.x) {
      this.CSS.map.left = `${this.dataTable.positionData.locations.map.x}px`;
      this.CSS.map.top = `${this.dataTable.positionData.locations.map.y}px`;
    }
    if (this.dataTable.positionData.locations.displayData.x) {
      this.CSS.data.left = `${this.dataTable.positionData.locations.displayData.x}px`;
      this.CSS.data.top = `${this.dataTable.positionData.locations.displayData.y}px`;
    }
    if (this.dataTable.positionData.locations.lava.x) {
      this.CSS.logos.lava.left = `${this.dataTable.positionData.locations.lava.x}px`;
      this.CSS.logos.lava.top = `${this.dataTable.positionData.locations.lava.y}px`;
    }
    if (this.dataTable.positionData.locations.heco.x) {
      this.CSS.logos.heco.left = `${this.dataTable.positionData.locations.heco.x}px`;
      this.CSS.logos.heco.top = `${this.dataTable.positionData.locations.heco.y}px`;
    }
    if (this.dataTable.positionData.percents.map > 0) {
      this.CSS.map.percent = `${this.dataTable.positionData.percents.map}`;
    }
    if (this.dataTable.positionData.percents.pie > 0) {
      this.CSS.charts.pie.percent = `${this.dataTable.positionData.percents.pie}`;
    }
    if (this.dataTable.positionData.percents.line > 0) {
      this.CSS.charts.line.percent = `${this.dataTable.positionData.percents.line}`;
    }
    if (this.dataTable.positionData.percents.lava > 0) {
      this.CSS.logos.lava.percent = `${this.dataTable.positionData.percents.lava}`;
    }
    if (this.dataTable.positionData.percents.heco > 0) {
      this.CSS.logos.heco.percent = `${this.dataTable.positionData.percents.heco}`;
    }
    if (this.dataTable.positionData.percents.displayData > 0) {
      this.CSS.data.percent = `${this.dataTable.positionData.percents.displayData}`;
    }

    if (this.windowService.saveFile({ filename: 'cssData.json', file: JSON.stringify({ file: 'cssData', css: this.CSS }) })) {
      console.log('Positon Data Saved.');
    } else {
      console.log('Failed to save position data.');
    }
  }

  /** When toolTips are clicked, this function notifies the tooltop element which data to display.
   * @param event the touch/click event.
   * @param id a string identifying which tooltip was clicked.
   */
  public handleToolTipEvent(event, id: string): void {
    const x = event.screenX;
    const y = event.screenY;
    this.tooltipSubject.next({ x: x, y: y, id: id });
  }

  /** Scrolling menus need their data fed through a subject.  Publishes all data at once and the component will
   * decide how to use it.
   */
  private publishScrollingMenuData(): void {
    this.scrollingMenuSubject.next([
      { type: 'year', data: this.getYears() },
      { type: 'scenario', data: this.getScenarioNames() }
    ]);
  }

  /** The years are loaded into an array. (scrolling menu and the circular data component.)
   * @return an array of all years used in the application.
  */
  private getYears(): number[] {
    const arr = [];
    for (let i = this.dataTable.year.min; i <= this.dataTable.year.max; i++) {
      arr.push(i);
    }
    return arr;
  }

  /** Loads an array of strings with all scenario displayNames used by the application. (scrolling menu.)
   * @return an array holding all scenario display names.
   */
  private getScenarioNames(): string[] {
    const arr = [];
    this.dataTable.scenario.all.forEach(s => arr.push(s.displayName));
    return arr;
  }

  /** Gets the array of all technologies (ie. wind, solar, offshore etc.) that are used in the application so
   * that the correct percentages can be calculated.
   * @param data all data used by the table.
   * @return an array of tech names and the color associated with that technology.
   * */
  private getTechData(data): any {
    const technologies = [];
    Object.keys(data[this.dataTable.scenario.name]).forEach(tech => {
      technologies.push({ name: tech, color: chartColors[tech] });
    });
    return technologies;
  }

  /** When a slider is moved, the distance from the left is calculated and fed to this funciton.  All
   * sliders begin at 50%.
   * @param percentFromLeft this is a percentage that the center of the slider is from the left of the bar.
   * @param id a string that identifies the slider.  ie. Map resize, etc.
   */
  public handleSliderChange(percentFromLeft: number, id: string) {
    let width = 0;
    let height = 0;

    switch (id) {
      case 'resize lava':
        this.dataTable.positionData.percents.lava = percentFromLeft;
        width = this.CSS.logos.lava.width;
        height = this.CSS.logos.lava.height;
        break;
      case 'resize map':
        this.dataTable.positionData.percents.map = percentFromLeft;
        width = this.CSS.map.width;
        height = this.CSS.map.height;
        break;
      case 'resize pie':
        this.dataTable.positionData.percents.pie = percentFromLeft;
        width = this.CSS.charts.pie.width;
        height = this.CSS.charts.pie.height;
        break;
      case 'resize line':
        this.dataTable.positionData.percents.line = percentFromLeft;
        height = this.CSS.charts.line.height;
        width = this.CSS.charts.line.width;
        break;
      case 'resize heco':
        this.dataTable.positionData.percents.heco = percentFromLeft;
        width = this.CSS.logos.heco.width;
        height = this.CSS.logos.heco.height;
        break;
      case 'resize data':
        this.dataTable.positionData.percents.displayData = percentFromLeft;
        width = this.CSS.data.width;
        height = this.CSS.data.height;
        break;
    }

    if (this.windowService.isMain()) {
      this.windowService.sendMessage({ type: 'resize', message: { percent: percentFromLeft, id: id, width: width, height: height } });
    }
  }

  /** Returns the current year data.
   * Years array, current year, current renewable percentage for that year, min year, max year.
   * @return the current year data.
   */
  public getCurrentYear(): any {
    return this.dataTable.year;
  }

  /** Gets all plans associated with the application. */
  public getAllPlans(): Plan[] {
    return this.plans;
  }

  /** When the app loads the css data from file, if there is nothing there, this file will create a new
   * set of css data and write it to the file.
   */
  private createCssData(): void {
    if (!this.CSS) {
      this.CSS = {};
    }
    if (!this.CSS.map) {
      this.CSS.map = {};
      this.CSS.map.left = `0px`;
      this.CSS.map.top = `0px`;
      this.CSS.map.percent = 0;
      this.CSS.map.width = 0;
      this.CSS.map.height = 0;
    }
    if (!this.CSS.charts) {
      this.CSS.charts = {};
    }
    if (!this.CSS.charts.line) {
      this.CSS.charts.line = {};
      this.CSS.charts.line.left = `0px`;
      this.CSS.charts.line.top = `0px`;
      this.CSS.charts.line.percent = 0;
      this.CSS.charts.line.width = 0;
      this.CSS.charts.line.height = 0;
    }
    if (!this.CSS.charts.pie) {
      this.CSS.charts.pie = {};
      this.CSS.charts.pie.left = `0px`;
      this.CSS.charts.pie.top = `0px`;
      this.CSS.charts.pie.percent = 0;
      this.CSS.charts.pie.width = 0;
      this.CSS.charts.pie.height = 0;
    }
    if (!this.CSS.logos) {
      this.CSS.logos = {};
    }
    if (!this.CSS.logos.lava) {
      this.CSS.logos.lava = {};
      this.CSS.logos.lava.left = `0px`;
      this.CSS.logos.lava.top = `0px`;
      this.CSS.logos.lava.percent = 0;
      this.CSS.logos.lava.width = 0;
      this.CSS.logos.lava.height = 0;
    }
    if (!this.CSS.logos.heco) {
      this.CSS.logos.heco = {};
      this.CSS.logos.heco.left = `0px`;
      this.CSS.logos.heco.top = `0px`;
      this.CSS.logos.heco.percent = 0;
      this.CSS.logos.heco.width = 0;
      this.CSS.logos.heco.height = 0;
    }
    if (!this.CSS.data) {
      this.CSS.data = {};
      this.CSS.data.left = `0px`;
      this.CSS.data.top = `0px`;
      this.CSS.data.percent = 0;
      this.CSS.data.width = 0;
      this.CSS.data.height = 0;
    }

    if (this.windowService.saveFile({ filename: 'cssData.json', file: JSON.stringify({ file: 'cssData', css: this.CSS }) })) {
      console.log('Positon Data Saved.');
    } else {
      console.log('Failed to save position data.');
    }
  }

  public updateCSSHeight(elementCategory: string, elementName: string, heightValue: number) {
    if (this.CSS) {
      if (elementCategory) {
        this.CSS[elementCategory][elementName].height = heightValue;
      } else {
        this.CSS[elementName].height = heightValue;
      }
    }
    if (!this.windowService.isMain()) {
      this.windowService.sendMessage({ type: 'update height', message: { cat: elementCategory, name: elementName, height: heightValue } });
    }

  }
  public updateCSSWidth(elementCategory: string, elementName: string, widthValue: number) {
    if (this.CSS) {
      if (elementCategory) {
        this.CSS[elementCategory][elementName].width = widthValue;
      } else {
        this.CSS[elementName].width = widthValue;
      }
      if (!this.windowService.isMain()) {
        this.windowService.sendMessage({ type: 'update width', message: { cat: elementCategory, name: elementName, width: widthValue } });
      }
    }
  }

  /** Debugging method that will print the datatable in its current state to the console. */
  public printDataTable(): void {
    console.log(JSON.stringify(this.dataTable));
  }

}
