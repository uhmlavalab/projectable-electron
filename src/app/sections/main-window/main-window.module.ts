import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Modules
import { MaterialModule } from '@app/material';
import { SharedModule } from '@app/shared';
import { ChartsModule } from '@app/charts';
import { MapsModule } from '@app/maps';
import { MainWindowRoutingModule } from './main-window-routing.module'
import { NgCircleProgressModule } from 'ng-circle-progress';


// Layout
import { MainWindowLayoutComponent } from './layout/main-window-layout.component';

// Routes
import { PlanSelectionComponent } from './routes/plan-selection/plan-selection.component';
import { TouchUiComponent } from './routes/touch-ui/touch-ui.component';

// Components
import { LayerButtonComponent } from './components/layer-button/layer-button.component';
import { ScenarioButtonComponent } from './components/scenario-button/scenario-button.component';
import { ScrollingMenuComponent } from './components/scrolling-menu/scrolling-menu.component'
import { MenuOptionComponent } from './components/scrolling-menu/components/menu-option/menu-option.component';
import { SliderComponent } from './components/slider/slider.component';
import { YearComponent } from './components/year/year.component';
import { YearBarComponent } from './components/year/components/year-bar/year-bar.component';
import { YearDisplayComponent } from './components/year-display/year-display.component';
import { SettingsModalComponent } from './components/settings-modal/settings-modal.component';
import { LayerInfoComponent } from './components/layer-info/layer-info.component';
import { TooltipComponent } from './components/tooltip/tooltip.component';


@NgModule({
  declarations: [
    MainWindowLayoutComponent,
    PlanSelectionComponent,
    TouchUiComponent,
    LayerButtonComponent,
    ScenarioButtonComponent,
    ScrollingMenuComponent,
    MenuOptionComponent,
    SliderComponent,
    YearBarComponent,
    YearComponent,
    YearDisplayComponent,
    SettingsModalComponent,
    LayerInfoComponent,
    TooltipComponent
  ],
  imports: [
    CommonModule,
    MaterialModule,
    SharedModule,
    ChartsModule,
    MapsModule,
    MainWindowRoutingModule,
    NgCircleProgressModule.forRoot({
      // set defaults here
      radius: 40,
      outerStrokeWidth: 4,
      innerStrokeWidth: 0,
      outerStrokeColor: '#78C000',
      innerStrokeColor: '#C7E596',
      animationDuration: 700
    })
  ],

})
export class MainWindowModule { }
