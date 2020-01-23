import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// Modules
import { SoundsModule } from '@app/sounds';
import { SectionsModule } from '@app/sections';

// Components
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';


@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    SectionsModule,
    SoundsModule,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
