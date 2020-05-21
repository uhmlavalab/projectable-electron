import { Component, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { Scenario } from '@app/interfaces';
import { PlanService } from '@app/services/plan.service';

@Component({
  selector: 'app-bar',
  templateUrl: './bar.component.html',
  styleUrls: ['./bar.component.css']
})
export class BarComponent implements AfterViewInit {

  @ViewChild('fossil', {static: false}) fosEl: ElementRef;
  @ViewChild('renew', {static: false}) renEl: ElementRef;
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
  text: string;

  constructor(private planService: PlanService) {
    this.allReady = {};
    this.allReady.planSet = false;
    this.allReady.scenarioSet = false;
    this.allReady.yearSet = false;
    this.allReady.dataSet = false;
    this.width = 0;
    this.height = 0;
    this.text = '';
  }

  ngAfterViewInit() {
    this.fosEl.nativeElement.style.backgroundColor = 'red';
    this.renEl.nativeElement.style.backgroundColor = 'green';

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
    this.myData.generation[this.scenario.name].yearlyData[this.year].forEach((d, index) => {
      curData.push({ label: this.myData.generation[this.scenario.name].data.labels[index], val: d });
      total += d;
    });
    const tempData = [];
    let renewTotal = 0;
    curData.forEach(d => {
     if (d.label === 'Fossil') {
       tempData.push([d.label, Math.round(d.val / total * 100)]);
     } else {
       renewTotal += d.val;
     }
    });

    tempData.push(['Renewable Energy', Math.round(renewTotal / total * 100)]);

    this.fosEl.nativeElement.style.height = tempData[0][1] + '%';
    this.renEl.nativeElement.style.height = tempData[1][1] + '%';
    this.text = `${tempData[1][1]}%`;
  }

}
