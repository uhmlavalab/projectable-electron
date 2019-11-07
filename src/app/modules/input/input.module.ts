import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { InputService } from './services/input.service';

// Keyboard Input
import { KeyboardComponent } from './schemes/keyboard/keyboard.component';



@NgModule({
  declarations: [
    KeyboardComponent,
  ],
  imports: [
    CommonModule
  ],
  providers: [
    InputService,
  ]
})
export class UserInputModule { }
