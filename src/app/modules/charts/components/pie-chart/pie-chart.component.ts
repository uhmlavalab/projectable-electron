import { Component, AfterViewInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { PlanService } from '@app/services/plan.service';

import { Scenario } from '@app/interfaces';

import { chartColors } from '../../../../../assets/plans/defaultColors';

@Component({
  selector: 'app-pie-chart',
  templateUrl: './pie-chart.component.html',
  styleUrls: ['./pie-chart.component.css']
})
export class PieChartComponent implements AfterViewInit {

  @ViewChild('pieDiv', { static: true }) chartDiv: ElementRef;
  ctx: any;
  myChart: any;

  generationData: any;
  scenario: Scenario;
  year: number;

  data: any;
  labels: any;
  chartMax: number;

  private planData: any;
  private allReady: any;

  private dataFetched = false;
  private width: number;
  private height: number;

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
    this.planService.resizeSubject.subscribe(data => {
      if (data) {
        let e = null;
        const percentage = data.percent / 100 * 2;
        if (data.id === 'resize pie') {
          e = this.chartDiv.nativeElement;
          if (this.width === 0) {
            this.width = e.getBoundingClientRect().width;
            this.height = e.getBoundingClientRect().height;
          }
          const newWidth = this.width * percentage;
          const newHeight = this.height * percentage;
          e.style.width = `${newWidth}px`;
          e.style.height = `${newHeight}px`;
        }
      }
    });

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

  private checkReadyState(): void {
    if (!this.dataFetched && this.allReady.planSet && this.allReady.scenarioSet && this.allReady.yearSet && this.allReady.dataSet) {
      this.fetchData();
    }
  }

  fetchData() {
      this.data = {};
      this.data.generation = {};
      Object.keys(this.planData).forEach(scenario => {
        this.data.generation[scenario] = {
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

          this.data.generation[scenario].data.labels.push(tech);
          this.data.generation[scenario].data.datasets[0].backgroundColor.push(chartColors[tech]);
          this.data.generation[scenario].data.datasets[0].borderColor.push('rgba(255,255,255,1)');

          Object.keys(this.planData[scenario][tech]).forEach(el => {
            const year = this.planData[scenario][tech][el].year;
            const value = this.planData[scenario][tech][el].value;
            if (!this.data.generation[scenario].yearlyData.hasOwnProperty(year)) {
              this.data.generation[scenario].yearlyData[year] = [];
            }
            this.data.generation[scenario].yearlyData[year].push(value);
          });
        });
      });
      this.dataFetched = true;
      this.createChart();

  }

  createChart() {
    const data = this.data.generation[this.scenario.name].data;
    data.datasets[0].data = this.data.generation[this.scenario.name].yearlyData[this.year];
    this.createPieChart(data);
  }

  createPieChart(data: any) {
    this.ctx = this.chartDiv.nativeElement.getContext('2d');
    this.myChart = new Chart(this.ctx, {
      type: 'pie',
      options: {
        // title: {
        //   display: true,
        //   text: 'Generation',
        //   position: 'top',
        //   fontColor: 'rgb(209, 235, 236)',
        //   fontSize: 18,
        //   fontFamily: 'Dalton Maag - Elevon OneG',
        //   defaultFontFamily: Chart.defaults.global.defaultFontFamily = 'Dalton Maag - Elevon OneG'
        // },
        legend: {
          display: false,
          labels: {
            fontColor: 'white',
            fontStyle: 'bold',
            fontSize: 12,
            fontFamily: 'Dalton Maag - Elevon OneG'

          }
        },
        responsive: false,
        plugins: {
          labels: [{
            render: 'label',
            position: 'border',
            fontSize: 10,
            overlap: false,
            fontStyle: 'bold',
            fontColor: 'white',
            fontFamily: 'Dalton Maag - Elevon OneG'

          },
          {
            render: 'percentage',
            fontColor: 'rgb(209, 235, 236)',
            fontSize: 8,
            fontStyle: 'bold',
            overlap: false,
            fontFamily: 'Dalton Maag - Elevon OneG'

          }]
        },
      },
      data
    });
  }

  updateYear(year: number) {
    if (this.myChart) {
      try {
        this.year = year;
        const data = this.data.generation[this.scenario.name].data;
        data.datasets[0].data = this.data.generation[this.scenario.name].yearlyData[this.year];
        this.myChart.data = data;
        this.myChart.update();
      } catch (error) {
        console.log('Error. Failed to update Year for Pie Chart.');
      }
    } else {
      this.year = year;
      this.allReady.yearSet = true;
    }

  }

  updateScenario(scenario: Scenario) {
    if (this.myChart) {
      try {
        this.scenario = scenario;
        const data = this.data.generation[scenario.name].data;
        data.datasets[0].data = this.data.generation[scenario.name].yearlyData[this.year];
        this.myChart.data = data;
        this.myChart.update();
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

}

