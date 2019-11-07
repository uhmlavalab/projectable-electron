import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../modules/material';

import { LeafletModule } from '@asymmetrik/ngx-leaflet';

// Layout
import { LandingLayoutComponent } from './layout/landing-layout.component';

// Routes
import { LandingRoutingModule } from './landing-routing.module';
import { NewPlanComponent } from './routes/new-plan/new-plan.component';
import { EditPlanComponent } from './routes/edit-plan/edit-plan.component';
import { PlansListComponent } from './routes/plans-list/plans-list.component';

// Components
import { BouncingTitleComponent } from './components/bouncing-title/bouncing-title.component';
import { TextTitleComponent } from './components/text-title/text-title.component';

@NgModule({
  declarations: [
    LandingLayoutComponent,
    BouncingTitleComponent,
    TextTitleComponent,
    NewPlanComponent,
    EditPlanComponent,
    PlansListComponent
  ],
  imports: [
    CommonModule,
    LandingRoutingModule,
    MaterialModule,
    LeafletModule
  ]
})
export class LandingModule { }
