import { Component, OnInit} from '@angular/core';
import { WindowService } from '@app/modules/window';
import { PlanService } from '@app/services/plan.service';


@Component({
  selector: 'app-island-selection-buttons',
  templateUrl: './island-selection-buttons.component.html',
  styleUrls: ['./island-selection-buttons.component.css']
})
export class IslandSelectionButtonsComponent implements OnInit{

    private islands: string[];
    private selectedIsland: string;
    constructor(private windowService: WindowService, private planService: PlanService ) {
      this.islands = ['Oahu', 'Maui', 'Big Island', 'Molokai'];
      this.selectedIsland = this.islands[0];
    }
    ngOnInit() {
      this.planService.islandNameSubject.subscribe(name => {
        if (name) {
          this.selectedIsland = name;
        }
      })
    }

    private changeIsland(island: string) {
      if (island !== 'Molokai' && island !== this.selectedIsland){
        if (confirm('Changing Island to ' + island + '.')){
          this.windowService.changeIsland(this.islands.indexOf(island));
        }
      } else if (island === 'Molokai') {
        alert('Molokai is currently unavailable.')
      }
    }
}