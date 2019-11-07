import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InputService {

  public inputEventSubject = new Subject<string>();

  public appInputAccepted = false;

  constructor() { }

  public sendInputEvent(eventName: string) {
    if (this.appInputAccepted) {
      this.inputEventSubject.next(eventName);
    }
  }

  public enableAppInput() {
    this.appInputAccepted = true;
  }

  public disableAppInput() {
    this.appInputAccepted = false;
  }
}
