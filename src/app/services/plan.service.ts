import { Injectable } from '@angular/core';
import { Plan } from '@app/interfaces/plan';
import { Plans } from '../../assets/plans/plans';
import { Scenario } from '@app/interfaces';
import { MapLayer } from '@app/interfaces';
import { BehaviorSubject } from 'rxjs';
import { chartColors } from '../../assets/plans/defaultColors';
import { SoundsService } from '@app/sounds';
import * as d3 from 'd3/d3.min';
import { WindowService } from '@app/modules/window';
import { DataTable } from '@app/interfaces/data-table';
import { connectableObservableDescriptor } from 'rxjs/internal/observable/ConnectableObservable';
import { Message } from '@angular/compiler/src/i18n/i18n_ast';

@Injectable({
  providedIn: 'root'
})
export class PlanService {

  private dataTable: DataTable; // This variable holds all active data.
  private CSS: any;       // Holds the css data for the positioning of the charts and map objects.
  private freshCss: boolean;    // True when a new css file is loaded, false if data is already in the file.

  // Data publishers.
  public planSetSubject = new BehaviorSubject<boolean>(false);          // Tells components when the plan is set.
  public islandNameSubject = new BehaviorSubject<string>(null);         // Publishes the name of the selected island.
  public toggleLayerSubject = new BehaviorSubject<{ layer: MapLayer, state: number }>(null); // Pubisher for when a layer is toggled
  public layersSubject = new BehaviorSubject<{ layer: MapLayer, state: number }[]>(null);    // Publishes array of all Layers.
  // Publishes the data for the layer info component.
  public layerInfoSubject = new BehaviorSubject<{ layer: MapLayer, state: number }>(null);
  // Publishes the data used to populate the menus. (scenario: string, year: number).
  public scrollingMenuSubject = new BehaviorSubject<[{ type: string, data: number[] }, { type: string, data: string[] }]>(null);
  public scenarioSubject = new BehaviorSubject<Scenario>(null);        // Scenario publisher
  public scenarioListSubject = new BehaviorSubject<Scenario[]>(null);  // Publishes an array of all scenarios.
  public yearSubject = new BehaviorSubject<number>(null);              // Published the current year data.
  public yearsSubject = new BehaviorSubject<number[]>(null);           // Publishes an array of all years.
  public precentRenewableByYearSubject = new BehaviorSubject<number>(null); // Publishes the percent renewable for a single year.
  // Publishes the repositioning data from the position modal.
  public positionSubject = new BehaviorSubject<{ id: string, x: number, y: number }>(null);
  // Publishes the resizing data from the position modal.
  public resizeSubject = new BehaviorSubject<{ id: string, width: number, height: number, percent: number }>(null);
  public closeModalSubject = new BehaviorSubject<{ saveData: boolean }>(null);           // Notifies the position modal to close.
  public openPositionModalSubject = new BehaviorSubject<boolean>(false);
  public turnSlideOutOffSubject = new BehaviorSubject<boolean>(false);
  public revertPositionsSubject = new BehaviorSubject<object>(null);   // Reverts repositioning on the map screen when changes are canceled.
  // changes slider tab when plus or minus is clicked.
  public slideOutSubject = new BehaviorSubject<boolean>(false);        // Toggles settings slide menu
  public adjustSliderPositionSubject = new BehaviorSubject<{ percent: number, id: string }>(null);
  public capDataSubject = new BehaviorSubject<object>(null);           // Publishes capacity data.
  public genDataSubject = new BehaviorSubject<object>(null);           // Publishes the generation data.
  public curDataSubject = new BehaviorSubject<object>(null);           // Puslishes the curtailment data.
  public technologySubject = new BehaviorSubject<string[]>(null);      // Publishes an array of all technologies and their colors.
  public cssSubject = new BehaviorSubject<object>(null);               // Publishes the css data.
  public tooltipSubject = new BehaviorSubject<{ x: number, y: number, id: string }>(null); // Publishes the which tooltip to display.
  // Publishes the size of the other screen.
  public windowDataSubject = new BehaviorSubject<{ main: boolean, width: number, height: number }>(null);
  public toggleElementSubject = new BehaviorSubject<{ tag: string, show: boolean }>(null); // Publishs visibility of elements
  public freshCssSubject = new BehaviorSubject<boolean>(null);         // Tells components if the css is a new load and needs to be set up.
  public getWidthSubject = new BehaviorSubject<boolean>(null);         // If the width data is not in css file, requests it from component.
  public redrawPathsSubject = new BehaviorSubject<boolean>(false);     // If the map is resized and saved, tells map to redraw parcel paths.
  public settingsModalOpenedSubject = new BehaviorSubject<boolean>(false); // When the modal is opened, the map needs to turn off layers.
  public settingsCanceledSubject = new BehaviorSubject<boolean>(false); // When modal closed, turn layers back of if they were off.
  public laserPointerSubject = new BehaviorSubject<{ x: number, y: number, start: boolean, end: boolean }>(null);

  constructor(private soundsService: SoundsService, private windowService: WindowService) {
    this.freshCss = true;            // Fresh css is set to true before checking.
    this.initializeDataTable();      // Set up the data table.
    this.windowService.cssSubject.subscribe(css => this.setCSS(css));
  }

  /** The data table stores the current state of the table. */
  private initializeDataTable(): void {
    // The dataTable stores all relevant data and can be printed to the console using the function printDataTable().
    this.dataTable = {
      state: 0,
      plan: {
        current: null,
        isSet: false,
        name: '',
        displayName: '',
      },
      // Map setup data.
      map: {
        scale: 0,
        miniScale: 0,
        width: 0,
        height: 0,
        bounds: null,
        path: '',
        miniMapPath: ''
      },
      year: {
        all: [],  // This array holds all of the years in sorted order.  It is used to populate components.
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
      // Components array is used to loop through all included map elements.  (loaded from the plan)
      components: [],
      // Holds all data for the table
      data: {
        // Paths hold the path to the csv file containing data.
        generationPath: null,
        curtailmentPath: null,
        capacityPath: null,
        // Array of the parsed data.
        generation: null,
        capacity: null,
        curtailment: null,
        tech: null             // An array of technologies used for looping.
      },
      // Holds data when elements are repositioned.  If user saves, these are copied to the css file.
      positionData: {
        locations: {},
        percents: {
          lava: -1,
          map: -1,
          pie: -1,
          heco: -1,
          data: -1
        }
      },
      // Holds data when user toggles elements.
      visibility: {
        lava: true,
        map: true,
        heco: true,
        pie: true,
        data: true,
        line: true
      }
    };
  }

  /* Start The Map */
  public startTheMap(plan: Plan): void {
    this.setupSelectedPlan(Plans.find(el => plan.name === el.name));
    this.setState(1);
    this.windowService.sendMessage({ type: 'state', message: 'run', plan: plan });
  }

  /** Sets Up the Current Plan
   * @param plan The plan to set up
   */
  public setupSelectedPlan(plan: Plan): void {
    this.dataTable.plan.current = plan;
    this.dataTable.plan.name = plan.name;
    this.dataTable.plan.displayName = plan.displayName;
    this.dataTable.plan.isSet = true;
    // Store all layers into an array.
    plan.map.mapLayers.forEach(layer => {
      this.dataTable.layers.all.push({ layer: layer, state: 0 });
    });

    // map data is loaded from the plan.  The width and height will be overwritten by the css.
    this.dataTable.map.scale = plan.map.scale;
    this.dataTable.map.miniScale = plan.map.miniMapScale;
    this.dataTable.map.width = plan.map.width;
    this.dataTable.map.height = plan.map.height;
    this.dataTable.map.bounds = plan.map.bounds;
    this.dataTable.map.path = plan.map.baseMapPath;
    this.dataTable.map.miniMapPath = plan.map.baseMiniMapPath;
    this.dataTable.year.min = plan.minYear;
    this.dataTable.year.max = plan.maxYear;
    this.dataTable.year.current = plan.minYear;
    this.getYears();  // Loads all years into the datatable
    this.dataTable.scenario.all = plan.scenarios;  // Load array with all scenarios associated with this plan
    this.dataTable.scenario.name = plan.scenarios[0].name;
    this.dataTable.scenario.display = plan.scenarios[0].displayName;
    this.dataTable.scenario.currentIndex = 0;
    this.dataTable.data.generationPath = plan.data.generationPath;
    this.dataTable.data.curtailmentPath = plan.data.curtailmentPath;
    this.dataTable.data.capacityPath = plan.data.capacityPath;
    this.dataTable.components = plan.mapElements;
    this.publishSetupData();
    this.loadAllData();
  }

  /** Once all of the data is properly initialized, this function will publish the data. */
  private publishSetupData(): void {
    this.planSetSubject.next(this.dataTable.plan.isSet);     // Notify components that the plan is set.
    this.islandNameSubject.next(this.dataTable.plan.displayName);
    this.yearSubject.next(this.dataTable.year.current);      // Publish current year
    this.yearsSubject.next(this.getYears());                 // Publish the array of all years used in the application.
    this.scenarioListSubject.next(this.dataTable.scenario.all); // Publish a list of scenarios.
    this.scenarioSubject.next(this.dataTable.scenario.all[this.dataTable.scenario.currentIndex]); // Publish current scenario
    this.layersSubject.next(this.dataTable.layers.all);      // Publish all layers used in the application.
    this.publishScrollingMenuData();                         // Populate the scrolling menus.
    this.updateNewPercentage();
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
    console.log( this.dataTable.data.generation);
    try {
      technologies.forEach(tech => {
        this.dataTable.data.generation[this.dataTable.scenario.name][tech].forEach(el => {
          if (el.year == this.dataTable.year.current) {
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
        if (el.year == this.dataTable.year.current) {
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
        if (el.year == this.dataTable.year.current) {
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
        if (data) {
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
        }
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

  public isMainWindow(): boolean {
    return this.windowService.isMain();
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

  public requestPercentageUpdate(): void {
    this.windowService.sendMessage({ type: 'request percent', message: true });
  }

  /** Sets the current percent of renewable for a specific year.
   * @param year the current year for the data.
   * @return the renewable percentage.
   */
  private setCurrentPercent(year: number): number {
    this.dataTable.renewableTotals.forEach(e => {
      // tslint:disable-next-line: triple-equals
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
      // tslint:disable-next-line: triple-equals
      const scenario = this.dataTable.scenario.all.find(s => s.name == scenarioName);  // Find the correct scenario in the datatable.
      if (scenario) {
        this.dataTable.renewableTotals = [];
        this.dataTable.scenario.currentIndex = this.dataTable.scenario.all.indexOf(scenario);  // Update the scenario index.
        this.dataTable.scenario.name = scenario.name;                                          // Update Scenario Name
        this.dataTable.scenario.display = scenario.displayName;                                // Update the Scenario display name.
        this.scenarioSubject.next(scenario);                                                   // Publish scenairo
        this.yearSubject.next(this.dataTable.year.current);                  // Force app to update data by resending year.
        this.updateNewPercentage();
        if (this.windowService.isMain()) {
          this.soundsService.playScenario(scenarioName);
        }
      }
    }
  }

  /** When the scenario is changed, we need to update the data displaying the renewable percentage.  The renewable percentages
   * are stored in the datatable.renewableTotals.  These values are populated by the year-bars so there must be enough time for 
   * all data to be calculated.  This function checkes every 100 seconds to make sure the correct number of data points is
   * avalible before seeing the value.
   */
  private updateNewPercentage() {
    if (this.dataTable.renewableTotals.length !== this.dataTable.year.all.length) {
      setTimeout(() => {
        this.updateNewPercentage();
      }, 200);
    } else {
      this.precentRenewableByYearSubject.next(this.setCurrentPercent(this.dataTable.year.current));  // Update renewable precentage.
      if (this.windowService.isMain) {
        this.windowService.sendMessage({ type: 'percent change', message: this.dataTable.year.currentRenewablePercent });
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
      path: this.dataTable.map.path,
      miniMapPath: this.dataTable.map.miniMapPath
    };
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
      this.revertPositionsSubject.next(this.CSS[this.dataTable.plan.name]);
      // Reset Data table
      this.dataTable.positionData.percents = {
        lava: -1,
        map: -1,
        pie: -1,
        heco: -1,
        data: -1
      };
    }
  }

  /** When the user uses the position modal to position map elements, the data changes are stored in the datatable.
   * @param data the id, x, y of the element being repositioned.
   */
  public updatePositionData(data) {
    this.dataTable.positionData.locations = data;
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
    this.dataTable.year.all = arr;
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

  /** Returns the current year data.
   * Years array, current year, current renewable percentage for that year, min year, max year.
   * @return the current year data.
   */
  public getCurrentYear(): any {
    return this.dataTable.year;
  }

  /** Gets all plans associated with the application. */
  public getAllPlans(): Plan[] {
    return Plans;
  }

  /** When the css file is loaded, the data is sent here to be stored and published so that elements can be positioned.
 * @param css the css data object.
 */
  private setCSS(css: any): void {

    if (!this.dataTable.plan.name) {
      setTimeout( () => this.setCSS(css), 100);
      return;
    }
    // The css data needs to have all of these paths.  If it doesn't, the app will make a new css file.
    if (!(css[this.dataTable.plan.name].charts && css[this.dataTable.plan.name].logos && css[this.dataTable.plan.name].map && css[this.dataTable.plan.name].data)) {
      // Create New Css File
      this.createCssData();
    }

    if (this.windowService.isMain()) {
      this.windowService.sendMessage({ type: 'css loaded', message: css })
    }
    /* The freshCss variable will be true throughout this entire function if the css data from the saved file is all 0's.  This
    happens when a new CSS data file is generated.  It will load the settings modal and ask the user to position elements before
    doing anything else */
    let freshCss = true;

    this.CSS = css;
    this.cssSubject.next(this.CSS[this.dataTable.plan.name]);

    /* Iterate thorugh the elements array.  Some elements have categories, like charts or logos and others do not.  Toggle the visibility
    of the element based on the saved values in the css file*/
    this.dataTable.components.forEach(e => {
      // tslint:disable-next-line: no-shadowed-variable
      const css_path = this.CSS[this.dataTable.plan.name][e.category][e.name];
      this.dataTable.visibility[e.name] = css_path.visible;
      this.toggleElement(e.name, css_path.visible);

      // Check to see if the positons are all equal to 0px.  If they are not, then this is not a fresh install.
      if (css_path.left !== '0px' && css_path.top !== '0px') {
        freshCss = false;
      }
    });

    const css_path = this.CSS[this.dataTable.plan.name];  // Define the path based on the loaded plan.

    // Resize the elements, but only in the map window.
    if (!this.windowService.isMain()) {
      if (css_path.charts.line.percent && css_path.charts.line.percent > 0) {
        this.resizeSubject.next(
          {
            id: 'resize line',
            width: css_path.charts.line.width,
            height: css_path.charts.line.height,
            percent: css_path.charts.line.percent
          }
        );
      }
      if (css_path.map.map.percent && css_path.map.map.percent > 0) {
        this.resizeSubject.next(
          {
            id: 'resize map',
            width: css_path.map.map.width,
            height: css_path.map.map.height,
            percent: css_path.map.map.percent
          }
        );
      }
      if (css_path.charts.pie.percent && css_path.charts.pie.percent > 0) {
        this.resizeSubject.next(
          {
            id: 'resize pie',
            width: css_path.charts.pie.width,
            height: css_path.charts.pie.height,
            percent: css_path.charts.pie.percent
          });
      }
    }
    // If this is a fresh install request the default width sizes of the elements and prompt the user to set new css data.
    if (freshCss) {
      // Need to capture the width of the elements since they were all reset.
      if (!this.windowService.isMain()) {
        this.getWidthSubject.next(true);
      }
      this.freshCssSubject.next(freshCss);
    } else {
      this.freshCss = false;
    }
  }

  /** When the user uses the position modal to move map elements around, the data can be saved to a file.  This function
   * saves that data and writes a file.  The data is saved in the positionData section of the dataTable.
   */
  private storeCssData(): void {
    this.dataTable.components.forEach(e => {
      // Set the path to the css data based on the plan name and if there is a category associated with the element.

      const css_path = this.CSS[this.dataTable.plan.name][e.category][e.name];

      // Check for changes in the data table.  If they exist, write them to the CSS object.
      if (this.dataTable.positionData.locations[e.name] && this.dataTable.positionData.locations[e.name].x) {
        css_path.left = `${this.dataTable.positionData.locations[e.name].x}px`;
        css_path.top = `${this.dataTable.positionData.locations[e.name].y}px`;
      }
      if (this.dataTable.positionData.percents[e.name] > 0) {
        css_path.percent = `${this.dataTable.positionData.percents[e.name]}`;
      }
      css_path.visible = this.dataTable.visibility[e.name];
    });

    // Save the data to the cssData.json file.
    if (this.windowService.saveFile({ filename: 'cssData.json', file: JSON.stringify({ file: 'cssData', css: this.CSS }) })) {
      console.log('Positon Data Saved.');
    } else {
      console.log('Failed to save position data.');
    }
  }

  /** When the app loads the css data from file, if there is nothing there, this file will create a new
   * set of css data and write it to the file.  This can also be called manually, but it will permanently overwrite any saved
   * CSS data.  The elements that need to be included in the file are found in the local variable, this.dataTable.components.  Any changes
   * will not be seen until the application restarts.
   */
  public createCssData(): void {
    if (!this.CSS) {
      this.CSS = {};
    }
    Plans.forEach(p => {
      if (!this.CSS[p.name]) {
        this.CSS[p.name] = {};
      }
      p.mapElements.forEach(e => {
        if (!this.CSS[p.name][e.category]) {
          this.CSS[p.name][e.category] = {};
        }
        if (!this.CSS[p.name][e.category][e.name]) {
          this.CSS[p.name][e.category][e.name] = {};
        }
        this.CSS[p.name][e.category][e.name].left = `0px`;
        this.CSS[p.name][e.category][e.name].top = `0px`;
        this.CSS[p.name][e.category][e.name].percent = 50;
        this.CSS[p.name][e.category][e.name].width = 0;
        this.CSS[p.name][e.category][e.name].height = 0;
        this.CSS[p.name][e.category][e.name].visible = true;
      });
    });
    if (this.windowService.saveFile({ filename: 'cssData.json', file: JSON.stringify({ file: 'cssData', css: this.CSS }) })) {
      console.log('Positon Data Saved.');
    } else {
      console.log('Failed to save position data.');
    }
  }

  /** Will turn the visibility of an element on or off.
   * @param tag the tag of the element to turn on or off.
   * @param show true if show, false if hide.
   */
  public toggleElement(tag: string, show: boolean): void {
    this.dataTable.visibility[tag] = show;
    if (this.windowService.isMain()) {
      this.windowService.sendMessage({ type: 'toggle visibility', message: { tag: tag, show: show } });
    } else {
      this.toggleElementSubject.next({ tag: tag, show: show });
    }
  }

  /** Updates the CSS object with the correct height for a map element
   * @param elementCategory string that defines the category in the CSS table.
   * @param elementName string that defines the name of the element to update
   * @param heightValue the height in pixels.
   * Not all elements have a category.
   * example this.css[heco-oahu][charts][pie].height
   *         this.css[map].height
   */
  public updateCSSHeight(elementCategory: string, elementName: string, heightValue: number) {
    if (this.CSS) {
      if (elementCategory) {
        this.CSS[this.dataTable.plan.name][elementCategory][elementName].height = heightValue;
      } else {
        this.CSS[this.dataTable.plan.name][elementName].height = heightValue;
      }
    }
    if (!this.windowService.isMain()) {
      this.windowService.sendMessage({ type: 'update height', message: { cat: elementCategory, name: elementName, height: heightValue } });
    }
  }

  /** Updates the CSS object with the correct width for a map element.
   * @param elementCategory string that defines the category in the CSS table.
   * @param elementName string that defines the name of the element to update
   * @param widthValue the width in pixels.
   * Not all elements have a category.
   * example this.css[heco-oahu][charts][pie].width
   *         this.css[map].width
   */
  public updateCSSWidth(elementCategory: string, elementName: string, widthValue: number) {
    if (this.CSS) {
      // set the path to the correct variable location.
      const css_path = this.CSS[this.dataTable.plan.name][elementCategory][elementName];
      css_path.width = widthValue;
      if (!this.windowService.isMain()) {
        this.windowService.sendMessage({ type: 'update width', message: { cat: elementCategory, name: elementName, width: widthValue } });
      }
    }
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

  /** When toolTips are clicked, this function notifies the tooltop element which data to display.
 * @param event the touch/click event.
 * @param id a string identifying which tooltip was clicked.
 */
  public handleToolTipEvent(event, id: string): void {
    const x = event.screenX;
    const y = event.screenY;
    this.tooltipSubject.next({ x: x, y: y, id: id });
  }

  /** When a slider is moved, the distance from the left is calculated and fed to this funciton.  All
   * sliders begin at 50%.
   * @param percentFromLeft this is a percentage that the center of the slider is from the left of the bar.
   * @param id a string that identifies the slider.  ie. Map resize, etc.
   */
  public handleSliderChange(percentFromLeft: number, id: string, category: string, name: string) {
    const css_path = this.CSS[this.dataTable.plan.name][category][name];
    this.dataTable.positionData.percents[name] = percentFromLeft;
    const width = css_path.width;
    const height = css_path.height;
    if (this.windowService.isMain()) {
      // tslint:disable-next-line: max-line-length
      this.windowService.sendMessage({ type: 'resize', message: { percent: percentFromLeft, id: id, width: width, height: height, category: category, name: name } });
    }
  }

  /** The setting modal has the option to increase or decrease the scale by small increments.  This is essentially the
   * same function as the handleSliderChange except it changes the percentage by 0.5% in either direction.
   */
  public handleSizeAdjustmentClick(val: number, category: string, name: string, id: string) {
    const css_path = this.CSS[this.dataTable.plan.name][category][name];
    if (this.dataTable.positionData.percents[name] === -1 || !this.dataTable.positionData.percents[name]) {
      this.dataTable.positionData.percents[name] = parseFloat(css_path.percent);
    }
    this.dataTable.positionData.percents[name] += val;
    const width = css_path.width;
    const height = css_path.height;
    if (this.windowService.isMain()) {
      // tslint:disable-next-line: max-line-length
      this.windowService.sendMessage({ type: 'resize', message: { percent: this.dataTable.positionData.percents[name], id: id, width: width, height: height, category: category, name: name } });
    }
    this.adjustSliderPositionSubject.next({ percent: this.dataTable.positionData.percents[name], id: id });
  }

  /** Toggles the selected layer and messages the other window.
   * @param layerName the name of the layer that was toggled.
   */
  public handleLayerButtonClick(layerName: string): void {
    this.toggleLayer(layerName);
    const msg = { type: 'toggle layer', message: layerName };
    this.windowService.sendMessage(msg);
  }

  /** When user clicks on a button, this function finds the layer to populate the layer info section and publishes it.
   * @param layerName a string representing the name of the layer to display data for.
   */
  public handleLayerButtonInfoClick(layerName: string) {
    this.layerInfoSubject.next(this.dataTable.layers.all.find(e => e.layer.name === layerName));
  }

  /** When the user opens the settings modal, the map is notified so that if can turn off any layers that are visible.
   * This is because if the user resizes the map, the layers will not resize at the same time.  They are resized only
   * if the user saves the new layout.
   */
  public settingsModalOpened(): void {
    this.windowService.sendMessage({ type: 'settings opened', message: true });
    this.openPositionModalSubject.next(true);
    this.toggleSlideOut(false);
    this.turnSlideOutOffSubject.next(true);
  }

  /** When the gear icon tab is touched or clicked, the settings menu slides in or out from the left side.
   * @param open true if opening the menu, false if closing the menu.
   */
  public toggleSlideOut(open: boolean): void {
    this.slideOutSubject.next(open);
  }

  /** Debugging method that will print the datatable in its current state to the console. */
  public printDataTable(): void {
    console.log(JSON.stringify(this.dataTable));
  }

  public handleLaserPointer(x: number, y: number, start: boolean, end: boolean) {
    this.windowService.sendMessage({ type: 'laser pointer', message: { x: x, y: y, start: start, end: end } });
  }

  /** When positioning elements, I pass a percentage for left and top because you could have two different screen resolutions
   * running.  Therefore, the components needs to know what the size of the other window is to convert the percentages.
   */
  public getOtherWindowData(): void {
    this.windowService.sendMessage({ type: 'get other window data', message: this.windowService.isMain() });
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
      this.handleSliderChange(msg.message.percent, msg.message.id, msg.message.category, msg.message.name);
    } else if (msg.type === 'update height') {
      this.updateCSSHeight(msg.message.cat, msg.message.name, msg.message.height);
    } else if (msg.type === 'update width') {
      this.updateCSSWidth(msg.message.cat, msg.message.name, msg.message.width);
    } else if (msg.type === 'toggle visibility') {
      this.toggleElement(msg.message.tag, msg.message.show);
    } else if (msg.type === 'get other window data') {
      const data = { main: this.windowService.isMain(), width: window.innerWidth, height: window.innerHeight };
      this.windowService.sendMessage({ type: 'receive other window data', message: data });
    } else if (msg.type === 'receive other window data') {
      this.windowDataSubject.next(msg.message);
    } else if (msg.type === 'request percent') {
      this.windowService.sendMessage({ type: 'percent change', message: this.dataTable.year.currentRenewablePercent });
    } else if (msg.type === 'settings opened') {
      this.settingsModalOpenedSubject.next(true);
    } else if (msg.type === 'laser pointer') {
      this.laserPointerSubject.next(msg.message);
    } else if (msg.type === 'css loaded') {
      if (!this.windowService.isMain()) {
        this.setCSS(msg.message);
      }
    } else if (msg.type === 'update cssData file') {
      if (!this.windowService.isMain() && msg.message.saveData) {
        this.storeCssData();
        this.redrawPathsSubject.next(true);
      } else if (!msg.message.saveData && !this.windowService.isMain()) {
        const css_path = this.CSS[this.dataTable.plan.name];
        this.revertPositionsSubject.next(css_path);
        this.settingsCanceledSubject.next(true);
        if (css_path.charts.line.percent && css_path.charts.line.percent > 0) {
          this.resizeSubject.next(
            {
              id: 'resize line',
              width: css_path.charts.line.width,
              height: css_path.charts.line.height,
              percent: css_path.charts.line.percent
            }
          );
        }
        if (css_path.map.map.percent && css_path.map.map.percent > 0) {
          // tslint:disable-next-line: max-line-length
          this.resizeSubject.next({ id: 'resize map', width: css_path.map.map.width, height: css_path.map.map.height, percent: css_path.map.map.percent });
        }
        if (css_path.charts.pie.percent && css_path.charts.pie.percent > 0) {
          // tslint:disable-next-line: max-line-length
          this.resizeSubject.next({ id: 'resize pie', width: css_path.charts.pie.width, height: css_path.charts.pie.height, percent: css_path.charts.pie.percent });
        }
      }
    }
    return true;
  }
}
