import { Component, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { PlanService } from '@app/services/plan.service';
import { TouchService } from '@app/services/touch.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-heco-main',
  templateUrl: './heco-main.component.html',
  styleUrls: ['./heco-main.component.css']
})
export class HecoMainComponent implements AfterViewInit {

  @ViewChild('map', { static: false, read: ElementRef }) mapElement;
  @ViewChild('pieChart', { static: false, read: ElementRef }) pieChart; // The custom Map component.
  @ViewChild('lineChart', { static: false, read: ElementRef }) lineChart; // The custom Map component.

  private uiWindow: any;
  private currentYear: number;          // Current Year
  private currentScenario: string;      // Current scenario.
  private messageCheckInterval: any;    // How often to check the local storage for messages (in Milliseconds.)

  constructor(private planService: PlanService,
    private window: Window,
    private touchService: TouchService,
    private router: Router) {

    this.messageCheckInterval = 20; // Set Milliseconds to check app for updates.

    /* Set the year and current scenario.  This data comes from the plan service.  If there is an error getting the data
    Then the plan was not properly set.  Rerout the application back to the landing page to try agian. */
    try {
      this.currentYear = this.planService.getMinimumYear();
      this.currentScenario = this.planService.getCurrentScenario().displayName;
    } catch (error) {
      this.router.navigateByUrl('');
      this.planService.setState('landing');
      this.touchService.closeUIWindow();
      console.log('No Plan Found --> Route to setup');
    }
  }

  ngAfterViewInit() {

    // Map and Charts are positioned from CSS data from the plan.
    this.positionMap();
    this.positionTopChart();
    this.positionBottomChart();

    // Open the second screen for the Touch UI and notify it of the current plan.
    this.touchService.openUIWindow();
    this.touchService.messageUI('plan', 'heco-oahu');

    // Subscribe to the local storages.
    this.messageCheckInterval = setInterval(() => {
      try {
        this.reviewMessage(this.touchService.readMessage());
      } catch (err) {
        // console.log('Failed to revieve a new message');
      }
    }, this.messageCheckInterval);

    // Subscribe to scenario Changes.
    this.planService.scenarioSubject.subscribe(scenario => {
      if (scenario) {
        this.currentScenario = scenario.displayName;
      }
    });

    // Subscribe to changes in the year.
    this.planService.yearSubject.subscribe(year => {
      if (year) {
        this.currentYear = year;
      }
    });
  }

  private reviewMessage(msg): void {
    const data = JSON.parse(msg);
    if (data.newMsg === 'true') {
      this.touchService.clearMessages();
      if (data.type === 'layer-update') {
        this.planService.toggleSelectedLayer(data.data);
      } else if (data.type === 'change year') {
        this.planService.setCurrentYear(parseInt(data.data, 10));
      } else if (data.type === 'change scenario') {
        this.planService.setScenario(data.data);
      }
    }
  }

  private positionMap(): void {
    try {
      //Select map element from viewchild
      const e = this.mapElement.nativeElement;
      // Get styles from the plan service.
      const styles = this.planService.getCss();
      e.style.left = styles.map.left;
      e.style.top = styles.map.top;
    } catch (error) {
      console.log('Failed To locate Element to position');
    }
  }

  private positionTopChart(): void {
    try {
      //Select map element from viewchild

      const e = this.lineChart.nativeElement;
      // Get styles from the plan service.
      const styles = this.planService.getCss();
      e.style.left = styles.charts.line.left;
      e.style.top = styles.charts.line.top;
    } catch (error) {
      console.log('Error.  Failed to find element to position.');
    }
  }

  private positionBottomChart(): void {
    try {
      //Select map element from viewchild
      const e = this.pieChart.nativeElement;
      // Get styles from the plan service.
      const styles = this.planService.getCss();
      e.style.left = styles.charts.pie.left;
      e.style.top = styles.charts.pie.top;
    } catch (error) {
      console.log('Error. Failed to find the element to position. ');
    }
  }
}
