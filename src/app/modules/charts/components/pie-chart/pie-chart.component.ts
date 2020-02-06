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

  constructor(private planService: PlanService) { }

  ngAfterViewInit() {
    this.planService.planSubject.subscribe(plan => {
      if (plan) {
        this.scenario = this.planService.getCurrentScenario();
        this.year = this.planService.getCurrentYear();
        this.fetchData();
      }
    });

    this.planService.scenarioSubject.subscribe(scenario => {
      if (scenario) {
        this.updateScenario(scenario);
      }
    });

    this.planService.yearSubject.subscribe(year => {
      if (year) {
        this.updateYear(year);
      }
    });

  }

  fetchData() {
    this.planService.getGenerationData().then(genData => {

      this.generationData = genData;
      this.data = {};
      this.data.generation = {};

      Object.keys(this.generationData).forEach(scenario => {
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

        Object.keys(this.generationData[scenario]).forEach(tech => {

          this.data.generation[scenario].data.labels.push(tech);
          this.data.generation[scenario].data.datasets[0].backgroundColor.push(chartColors[tech]);
          this.data.generation[scenario].data.datasets[0].borderColor.push('rgba(255,255,255,1)');

          Object.keys(this.generationData[scenario][tech]).forEach(el => {
            const year = this.generationData[scenario][tech][el].year;
            const value = this.generationData[scenario][tech][el].value;
            if (!this.data.generation[scenario].yearlyData.hasOwnProperty(year)) {
              this.data.generation[scenario].yearlyData[year] = [];
            }
            this.data.generation[scenario].yearlyData[year].push(value);
          });
        });
      });
      this.createChart();
    });

  }

  createChart() {
    console.log(this.data);
    const data = this.data.generation[this.scenario.name].data;
    data.datasets[0].data = this.data.generation[this.scenario.name].yearlyData[this.year];
    this.createPieChart(data);
  }

  createPieChart(data: any) {
    this.ctx = this.chartDiv.nativeElement.getContext('2d');
    this.myChart = new Chart(this.ctx, {
      type: 'pie',
      options: {
        title: {
          display: true,
          text: 'Generation',
          position: 'top',
          fontColor: 'white',
          fontSize: 18,
          fontFamily: "'Dalton Maag - Elevon OneG'",
          defaultFontFamily: Chart.defaults.global.defaultFontFamily = "'Dalton Maag - Elevon OneG'"
        },
        legend: {
          display: false,
          labels: {
            fontColor: 'white',
            fontStyle: 'bold',
            fontSize: 14,
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
            fontColor: 'white',
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
    if (this.data) {
      try {
        this.year = year;
        const data = this.data.generation[this.scenario.name].data;
        data.datasets[0].data = this.data.generation[this.scenario.name].yearlyData[this.year];
        this.myChart.data = data;
        this.myChart.update();
      } catch (error) {
        console.log('Error. Failed to update Year for Pie Chart.');
      }
    }

  }

  updateScenario(scenario: Scenario) {
    if (this.data) {
      try {
        this.scenario = scenario;
        const data = this.data.generation[scenario.name].data;
        data.datasets[0].data = this.data.generation[scenario.name].yearlyData[this.year];
        this.myChart.data = data;
        this.myChart.update();
      } catch (error) {
        console.log('Error.  Failed to update Scenario for Pie Chart');
      }
    }

  }

}

