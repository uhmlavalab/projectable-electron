import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Services
import { PlanService } from './services/plan.service';

@NgModule({
  imports: [
    CommonModule
  ],
  providers: [
    PlanService
  ]
})
export class PlanModule { }
