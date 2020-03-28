import { Injectable, NgZone } from '@angular/core';
import { ipcRenderer } from 'electron';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';


@Injectable({
  providedIn: 'root'
})
export class WindowService {


  windowName: string;
  windowMessageSubject = new Subject<any>();
  fileData: string[];

  constructor(private router: Router, private ngZone: NgZone) {
    this.windowName = '';
    this.fileData = [];
    ipcRenderer.on('window-is-set', (event, message) => {
      if (message.windowName === 'main') {
        this.setAsMainWindow();
      } else if (message.windowName == 'map') {
        this.setAsMapWindow();
      }
    });
  }

  public setAsMainWindow() {
    this.windowName = 'main';
    ipcRenderer.removeListener('window-is-set', () => { });
    ipcRenderer.send('set-main-window');
    ipcRenderer.on('message-for-main-window', (event, message) => this.mainWindowMessage(event, message));
    this.ngZone.run(() => {
      this.router.navigate(['main-window']);
    });
  }

  public setAsMapWindow() {
    this.windowName = 'map';
    ipcRenderer.removeListener('window-is-set', () => { });
    ipcRenderer.send('set-map-window');
    ipcRenderer.on('message-for-map-window', (event, message) => this.mapWindowMessage(event, message));
    this.ngZone.run(() => {
      this.router.navigate(['map-window']);
    });
  }

  public isMain(): boolean {
    return this.windowName === 'main';
  }

  private mapWindowMessage(event: Electron.IpcRendererEvent, data: any) {
    this.resetCheck(data.reset);
    this.windowMessageSubject.next(data);
    //console.log(data);
  }

  private mainWindowMessage(event: Electron.IpcRendererEvent, data: any) {
    this.resetCheck(data.reset);
    this.windowMessageSubject.next(data);
    //console.log(data);
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

  private resetCheck(value: boolean) {
    if (value) {
      window.location.reload();
    }
  }

  public closeAppliction() {
    ipcRenderer.send('close');
  }

  public saveFile(data: { filename: string, file: any }) {
    ipcRenderer.send('saveFile', data);
  }

  public loadFile(fileUrl: string) {
    ipcRenderer.send('loadFile', fileUrl);
    ipcRenderer.on('fileLoaded', (event, message) => {
      this.fileData.push(JSON.parse(message));
      ipcRenderer.removeListener('fileLoaded', () => { });
     }
    );
  }

  public getFileData(): void {
    this.sendMessage({type: 'file information', message: this.fileData});
  }

  public getCssFileData(): any {
    return this.fileData[0];
  }
}
