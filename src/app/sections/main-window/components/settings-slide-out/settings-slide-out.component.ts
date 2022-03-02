import { Component, OnInit } from '@angular/core';
import { PlanService } from '@app/services/plan.service';
import { WindowService } from '@app/modules/window';
import { SoundsService } from '@app/modules/sounds';

@Component({
  selector: 'app-settings-slide-out',
  templateUrl: './settings-slide-out.component.html',
  styleUrls: ['./settings-slide-out.component.css']
})
export class SettingsSlideOutComponent implements OnInit {

  private opened: boolean;

  constructor(private planService: PlanService, private windowService: WindowService, private soundsService: SoundsService) {
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

  private playIntroduction(): void {
    this.soundsService.playIntroDescription();
  }

  private pauseIntroduction(): void {
    this.soundsService.pauseIntroDescription();
  }

  private stopIntroduction(): void {
    this.soundsService.stopIntroDescription();
  }

  /** opens and closes the settings (positioning) modal. */
  private togglePositionElements(): void {
    this.planService.settingsModalOpened();
  }
}
