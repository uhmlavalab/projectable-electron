import { Component, OnInit } from '@angular/core';
import { PlanService } from '@app/services/plan.service';

@Component({
  selector: 'app-layer-info',
  templateUrl: './layer-info.component.html',
  styleUrls: ['./layer-info.component.css']
})
export class LayerInfoComponent implements OnInit {
  private layer: any;
  private layerSet: boolean;
  constructor(private planService: PlanService) {
    this.layerSet = false;
    this.layer = null;
   }

  ngOnInit() {
    this.planService.layerInfoSubject.subscribe(e=>
      {
        if (e) {
          this.layerSet = true;
          this.layer = e.layer;
        }
      });
  }


}
