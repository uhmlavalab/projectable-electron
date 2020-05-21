import { Component, AfterViewInit, Input, ViewChild, ElementRef } from '@angular/core';
import { Scenario } from '@app/interfaces';
import { PlanService } from '@app/services/plan.service';
import { chartColors } from '../../../../assets/plans/defaultColors';

@Component({
  selector: 'app-gague-chart',
  templateUrl: './gague-chart.component.html',
  styleUrls: ['./gague-chart.component.css']
})
export class GagueChartComponent implements AfterViewInit {

  @Input() dataType: string;
  @ViewChild('gauge', {static: false}) el: ElementRef;
  title: string;
  type: string;
  data: any[];
  columnNames: string[];
  options: any;
  width: number;
  height: number;
  private allReady: any;
  private dataFetched = false;
  generationData: any;
  scenario: Scenario;
  planData: any;
  myData: any;
  year: number;
  colors: string[];
  percentage: string;

  constructor(private planService: PlanService) {

    this.allReady = {};
    this.allReady.planSet = false;
    this.allReady.scenarioSet = false;
    this.allReady.yearSet = false;
    this.allReady.dataSet = false;
    this.width = 0;
    this.height = 0;
  }

  ngAfterViewInit() {

    // setTimeout( () => {
    //   this.data = [
    //     ['Firefox', 0.7],
    //     ['IE', 26.8],
    //     ['Chrome', 12.8],
    //     ['Safari', 8.5],
    //     ['Opera', 6.2],
    //     ['Others', 45.0]
    //   ];
    // }, 10000);

    this.planService.planSetSubject.subscribe(plan => {
      if (plan) {
        this.allReady.planSet = true;
        this.checkReadyState();
      }
    });

    this.planService.scenarioSubject.subscribe(scenario => {
      if (scenario) {
        this.updateScenario(scenario);
        this.checkReadyState();
      }
    });

    this.planService.yearSubject.subscribe(year => {
      if (year) {
        this.updateYear(year);
        this.checkReadyState();
      }
    });

    this.planService.genDataSubject.subscribe(value => {
      if (value) {
        this.updateData(value);
        this.checkReadyState();
      }
    });

  }

  updateYear(year: number) {
    if (this.isReady()) {
      try {
        this.year = year;
        this.setData();
      } catch (error) {
        console.log('Error. Failed to update Year for Pie Chart.');
      }
    } else {
      this.year = year;
      this.allReady.yearSet = true;
    }

  }

  updateScenario(scenario: Scenario) {
    if (this.isReady()) {
      try {
        this.scenario = scenario;
        this.setData();
      } catch (error) {
        console.log('Error.  Failed to update Scenario for Pie Chart');
      }
    } else {
      this.scenario = scenario;
      this.allReady.scenarioSet = true;
    }
  }

  private updateData(data: any) {
    this.planData = data;
    this.allReady.dataSet = true;
  }

  private checkReadyState(): void {
    if (!this.dataFetched && this.allReady.planSet && this.allReady.scenarioSet && this.allReady.yearSet && this.allReady.dataSet) {
      this.fetchData();
    }
  }
  private isReady(): boolean {
    if (this.allReady.planSet && this.allReady.scenarioSet && this.allReady.yearSet && this.allReady.dataSet) {
      return true;
    } else {
      return false;
    }
  }

  fetchData() {
    this.myData = {};
    this.myData.generation = {};
    Object.keys(this.planData).forEach(scenario => {
      this.myData.generation[scenario] = {
        data: {
          labels: [],
          datasets: [{
            label: 'Generation MWh',
            data: [],
            backgroundColor: [],
            borderColor: [],
            borderWidth: 4
          }]
        },
        yearlyData: {}
      };

      Object.keys(this.planData[scenario]).forEach(tech => {

        this.myData.generation[scenario].data.labels.push(tech);
        this.myData.generation[scenario].data.datasets[0].backgroundColor.push(chartColors[tech]);
        this.myData.generation[scenario].data.datasets[0].borderColor.push('rgba(255,255,255,1)');

        Object.keys(this.planData[scenario][tech]).forEach(el => {
          const year = this.planData[scenario][tech][el].year;
          const value = this.planData[scenario][tech][el].value;
          if (!this.myData.generation[scenario].yearlyData.hasOwnProperty(year)) {
            this.myData.generation[scenario].yearlyData[year] = [];
          }
          this.myData.generation[scenario].yearlyData[year].push(value);
        });
      });
    });
    this.dataFetched = true;
    this.setData();
  }

  private setData(): void {
    let total = 0;
    const curData = [];
    const curLabels = [];
    let color = '';

    this.myData.generation[this.scenario.name].yearlyData[this.year].forEach((d, index) => {
      total += d;
      curData.push({ label: this.myData.generation[this.scenario.name].data.labels[index], val: d });
      if (curData[curData.length - 1].label === this.dataType) {
      color = this.myData.generation[this.scenario.name].data.datasets[0].backgroundColor[index];
      }
    });

    const tempData = [];
    curData.forEach(d => {
      if (d.label === this.dataType) {
        tempData.push([d.label, Math.round(d.val / total * 100)]);
      }
    });
    this.el.nativeElement.style.backgroundImage = `linear-gradient(to right, ${color} ${tempData[0][1]}%, rgba(155, 155, 155, 0.2) ${tempData[0][1] + .001}%`;
    this.percentage = `${tempData[0][1]}%`;
  }
}
