import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../material'

import { NewPlanComponent } from './components/new-plan/new-plan.component';
import { EditPlanComponent } from './components/edit-plan/edit-plan.component';
import { PlansListComponent } from './components/plans-list/plans-list.component';

import { BouncingTitleComponent } from './components/bouncing-title/bouncing-title.component';
import { TextTitleComponent } from './components/text-title/text-title.component';


@NgModule({
  declarations: [
    NewPlanComponent,
    EditPlanComponent,
    PlansListComponent,
    BouncingTitleComponent,
    TextTitleComponent
  ],
  exports: [
    NewPlanComponent,
    EditPlanComponent,
    PlansListComponent,
    BouncingTitleComponent,
    TextTitleComponent
  ],
  
  imports: [
    CommonModule,
    MaterialModule
  ],
})
export class SharedModule { }
