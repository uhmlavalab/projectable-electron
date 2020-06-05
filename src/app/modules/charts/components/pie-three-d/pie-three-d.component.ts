import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { PlanService } from '@app/services/plan.service';
import { Scenario } from '@app/interfaces/scenario';
import { chartColors } from '../../../../../assets/plans/defaultColors';


@Component({
  selector: 'app-pie-three-d',
  templateUrl: './pie-three-d.component.html',
  styleUrls: ['./pie-three-d.component.css']
})
export class PieThreeDComponent implements AfterViewInit {

  @ViewChild('testChart', { static: false }) testChart: ElementRef;

  title: string;
  type: string;
  data: any;
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
  chart: any;

  constructor(private planService: PlanService) {

    this.options = {
      width: 300,
      height: 300,
      backgroundColor: 'black',
      color: 'white',
      is3D: true,
      animation: {
        duration: 300,
        startup: true
      },
      legend: {
        position: 'none'
      },
      chartArea: { left: 0, top: 0, width: '130%', height: '130%' },
      title: 'Energy Generation',
      titleTextStyle: {
        color: 'white'
      }
    };
    this.allReady = {};
    this.allReady.planSet = false;
    this.allReady.scenarioSet = false;
    this.allReady.yearSet = false;
    this.allReady.dataSet = false;
    this.width = 0;
    this.height = 0;
  }



  ngAfterViewInit() {
    google.charts.load('current', { 'packages': ['corechart'] });
    google.charts.setOnLoadCallback(this.drawChart);

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
    this.myData.generation[this.scenario.name].yearlyData[this.year].forEach((d, index) => {
      total += d;
      curData.push({ label: this.myData.generation[this.scenario.name].data.labels[index], val: d });
    });
    this.options.colors = this.myData.generation[this.scenario.name].data.datasets[0].backgroundColor;
    const tempData = [];
    tempData.push(['Tech', 'Val']);
    curData.forEach(d => {
      tempData.push([d.label, d.val]);
    });
    this.data = tempData;
    this.drawChart();
  }

  drawChart = () => {
    try {
      const data = google.visualization.arrayToDataTable(this.data);
      const chart = new google.visualization.PieChart(this.testChart.nativeElement);
      chart.draw(data, this.options);
    } catch (e) {
      // Fail
    }

  }

}
