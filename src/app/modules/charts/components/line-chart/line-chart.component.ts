import { Component, AfterViewInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { PlanService } from '@app/services/plan.service';

import { Scenario } from '@app/interfaces';

import { chartColors } from '../../../../../assets/plans/defaultColors';

@Component({
  selector: 'app-line-chart',
  templateUrl: './line-chart.component.html',
  styleUrls: ['./line-chart.component.css']
})
export class LineChartComponent implements AfterViewInit {

  @ViewChild('lineDiv', { static: true }) chartDiv: ElementRef;
  ctx: any;
  myChart: any;

  capacityData: any;
  scenario: Scenario;
  year: number;

  data: any;
  labels: any;
  chartMax: number;
  
  constructor(private planService: PlanService) {
    
  }

  ngAfterViewInit() {

    this.planService.planSubject.subscribe(plan => {
      console.log(plan)
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
    this.planService.getCapacityData().then(capData => {
      this.capacityData = capData;
      this.data = {};
      this.data.capacity = {};
      const valueArray = [];
      Object.keys(this.capacityData).forEach(scenario => {
        this.data.capacity[scenario] = {};
        this.data.capacity[scenario].labels = [];
        this.data.capacity[scenario].datasets = [];

        Object.keys(this.capacityData[scenario]).forEach(tech => {
          const dataset = {
            label: tech,
            backgroundColor: chartColors[tech],
            borderColor: chartColors[tech],
            pointRadius: 0,
            fill: false,
            data: [],
          };
          Object.keys(this.capacityData[scenario][tech]).forEach(el => {
            const year = this.capacityData[scenario][tech][el].year;
            const value = this.capacityData[scenario][tech][el].value;
            this.data.capacity[scenario].labels.push(year);
            dataset.data.push(value);
            valueArray.push(value);
          });
          this.data.capacity[scenario].datasets.push(dataset);
        });
        this.data.capacity[scenario].labels = [...new Set(this.data.capacity[scenario].labels)];
      });
      this.chartMax = Math.ceil(Math.max(...valueArray) / 100) * 100;
      this.createChart();
    });

  }

  createChart() {
    const labels = this.data.capacity[this.scenario.name].labels;
    const datasets = this.data.capacity[this.scenario.name].datasets;
    this.createLineChart(labels, datasets);
  }

  createLineChart(labels: any[], datasets: any[]) {
    this.ctx = this.chartDiv.nativeElement.getContext('2d');
    this.myChart = new Chart(this.ctx, {
      type: 'line',
      options: {
        responsive: false,
        annotation: {
          annotations: [
            {
              drawTime: 'afterDatasetsDraw',
              type: 'line',
              mode: 'vertical',
              scaleID: 'x-axis-0',
              value: this.year,
              borderWidth: 3,
              borderColor: 'white',
              borderDash: [5, 5],
              label: {
                content: this.year,
                enabled: true,
                position: 'top'
              }
            }
          ]
        },
        legend: {
          labels: {
            fontColor: 'white',
            fontStyle: 'bold',
            fontSize: 14
          }
        },
        scales: {
          xAxes: [{
            display: true,
            gridLines: {
              display: false,
              color: '#FFFFFF',
            },
            ticks: {
              fontSize: 14,
              fontStyle: 'bold',
              fontColor: 'white',
            },
            scaleLabel: {
              display: true,
              fontSize: 18,
              fontStyle: 'bold',
              fontColor: '#FFFFFF',
              labelString: 'Year'
            }
          }],
          yAxes: [{
            display: true,
            gridLines: {
              display: true,
              color: '#FFFFFF',
            },
            ticks: {
              fontSize: 14,
              fontStyle: 'bold',
              fontColor: 'white',
              max: this.chartMax
            },
            scaleLabel: {
              display: true,
              fontSize: 18,
              fontStyle: 'bold',
              fontColor: '#FFFFFF',
              labelString: 'Capacity (MW)'
            }
          }]
        }
      },
      data: {
        labels,
        datasets
      },
    });
  }

  updateYear(year: number) {
    if (this.myChart) {
      try {
        this.year = year;
        this.myChart.options.annotation.annotations[0].value = this.year;
        this.myChart.options.annotation.annotations[0].label.content = this.year;
        this.myChart.update();
      } catch (error) {
        console.log('Error.  Failed to update year for Line Chart.');
      }
    }

  }

  updateScenario(scenario: Scenario) {
    if (this.myChart) {
      try {
        this.scenario = scenario;
        this.myChart.data.datasets = this.data.capacity[this.scenario.name].datasets;
        this.myChart.update();
      } catch (error) {
        console.log('Error.  Failed to update scenario for Line Chart.');
      }
    }
  }

}

