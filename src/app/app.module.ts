import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// Modules
import { SectionsModule } from '@app/sections';

// Components
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// Services
import { ContentDeliveryService } from './services/content-delivery.service';
import { PlanService } from './services/plan.service';
import { TouchService } from './services/touch.service';
import { UiServiceService } from './services/ui-service.service';

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    SectionsModule,
  ],
  providers: [
    ContentDeliveryService,
    PlanService,
    TouchService,
    UiServiceService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
