import { Injectable } from '@angular/core';
import { ipcRenderer } from 'electron';
import { BehaviorSubject, Subject } from 'rxjs';
import { Router } from '@angular/router';


@Injectable({
  providedIn: 'root'
})
export class WindowService {


  windowName: string;
  windowMessageSubject = new Subject<any>();

  constructor(private router: Router, ) {
    this.windowName = '';
    ipcRenderer.on('window-is-set', (event, message) => {
      console.log(message)
      if (message.windowName === 'main') {
        this.setAsMainWindow();
      } else if (message.windowName == 'map') {
        this.setAsMapWindow();
      }
    });
    ipcRenderer.send('is-window-set', {});
    console.log('hi')
  }

  public setAsMainWindow() {
    this.windowName = 'main';
    ipcRenderer.removeListener('window-is-set', () => { });
    ipcRenderer.send('set-main-window');
    ipcRenderer.on('message-for-main-window', (event, message) => this.mainWindowMessage(event, message));
    this.router.navigate(['main-window']);
  }

  public setAsMapWindow() {
    this.windowName = 'map';
    ipcRenderer.removeListener('window-is-set', () => { });
    ipcRenderer.send('set-map-window');
    ipcRenderer.on('message-for-map-window', (event, message) => this.mapWindowMessage(event, message));
    this.router.navigate(['map-window']);
  }

  private mapWindowMessage(event: Electron.IpcRendererEvent, data: any) {
    if (data.reset) {
      this.windowName = '';
      this.router.navigate(['landing']);
    }
    this.windowMessageSubject.next(data);
    console.log(data);
  }

  private mainWindowMessage(event: Electron.IpcRendererEvent, data: any) {
    if (data.reset) {
      this.router.navigate(['landing']);
    }
    this.windowMessageSubject.next(data);
    console.log(data);
  }

  public sendMessage(data: any) {
    if (this.windowName == 'map') {
      ipcRenderer.send('message-to-main-window', data);
    } else if (this.windowName == 'main') {
      ipcRenderer.send('message-to-map-window', data);
    }
  }

  public resetAllWindows() {
    ipcRenderer.send('clear-window-selections', {});
  }

}
