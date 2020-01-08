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

  }

  setAsMainWindow() {
    this.windowName = 'main';
    ipcRenderer.on('message-for-main-window', (event, message) => this.mapWindowMessage(event, message));
    this.windowSet.next(true);
  }

  setAsMapWindow() {
    this.windowName = 'map';
    ipcRenderer.on('message-for-map-window', (event, message) => this.mainWindowMessage(event, message));
    this.windowSet.next(true);
  }

  mapWindowMessage(event: Electron.IpcRendererEvent, data: any[]) {
    console.log(data);
  }
  mainWindowMessage(event: Electron.IpcRendererEvent, data: any[]) {
    console.log(data);
  }

  sendMessageToMapWindow(data: any[]) {
    if (this.windowName == 'map') return;
    ipcRenderer.send('message-to-map-window', data);

  }

  sendMessageToMainWindow(data: any[]) {
    if (this.windowName == 'main') return;
    ipcRenderer.send('message-to-main-window', data);
  }
}
