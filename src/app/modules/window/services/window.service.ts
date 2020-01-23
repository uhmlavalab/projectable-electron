import { Injectable } from '@angular/core';
import { ipcRenderer } from 'electron';
import { BehaviorSubject } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class WindowService {


  windowName: string;
  windowSet = new BehaviorSubject<boolean>(false);

  constructor() {
    ipcRenderer.send('clear-window-selections', null);
    this.windowName = '';
  }

  setAsMainWindow() {
    this.windowName = 'main';
    this.windowSet.next(true);
    ipcRenderer.on('message-for-main-window', (event, message) => this.mainWindowMessage(event, message));
  }

  setAsMapWindow() {
    this.windowName = 'map';
    this.windowSet.next(true);
    ipcRenderer.on('message-for-map-window', (event, message) => this.mapWindowMessage(event, message));
  }

  mapWindowMessage(event: Electron.IpcRendererEvent, data: any[]) {
    // Process the message
    console.log(data);
  }
  mainWindowMessage(event: Electron.IpcRendererEvent, data: any[]) {
    // Process the message
    console.log(data);
  }

  public sendMessage(data: any[]) {
    if (this.windowName == 'map') {
      ipcRenderer.send('message-to-main-window', data);
    } else if (this.windowName == 'main') {
      ipcRenderer.send('message-to-map-window', data);
    }
  } 

}
