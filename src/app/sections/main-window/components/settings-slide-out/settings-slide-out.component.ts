import { Component, OnInit } from '@angular/core';
import { PlanService } from '@app/services/plan.service';
import { WindowService } from '@app/modules/window';

@Component({
  selector: 'app-settings-slide-out',
  templateUrl: './settings-slide-out.component.html',
  styleUrls: ['./settings-slide-out.component.css']
})
export class SettingsSlideOutComponent implements OnInit {

  private opened: boolean;

  constructor(private planService: PlanService, private windowService: WindowService) {
    this.opened = false;
  }

  ngOnInit() {
    this.planService.turnSlideOutOffSubject.subscribe(val => {
      if (val) {
        this.opened = false;
      }
    });

  }
  private toggle(): void {
    this.opened = !this.opened;
    this.planService.toggleSlideOut(this.opened);
  }

  private restartTable(): void {
    this.windowService.resetAllWindows();
  }

  private quitTable(): void {
    this.windowService.closeAppliction();
  }

  private resetCss(): void {
    if (confirm('Resetting CSS Data is permanent.  Click confirm to proceed.')) {
      this.planService.createCssData();
      this.windowService.resetAllWindows();
    }
  }

  /** opens and closes the settings (positioning) modal. */
  private togglePositionElements(): void {
    this.planService.settingsModalOpened();
  }
}
