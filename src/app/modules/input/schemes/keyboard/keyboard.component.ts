import { Component, HostListener, Input } from '@angular/core';
import { InputService } from '../../services/input.service';

export interface KeyboardInput {
  key: string;
  eventname: string;
}

@Component({
  selector: 'app-keyboard',
  template: '',
  styles: ['']
})
export class KeyboardComponent {

  @Input() keyboardCommands: KeyboardInput[];

  @HostListener('window:keydown', ['$event'])
  keyEvent(event: KeyboardEvent) {
    const command = this.keyboardCommands.find(el => el.key === event.key);
    if (command) {
      this.inputService.sendInputEvent(command.eventname);
    }
  }

  constructor(private inputService: InputService) { }

}

