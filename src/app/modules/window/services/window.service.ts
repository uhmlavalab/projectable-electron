import { Injectable, NgZone } from '@angular/core';
import { ipcRenderer, screen } from 'electron';
import { Subject, BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';


@Injectable({
  providedIn: 'root'
})
export class WindowService {


  windowName: string;
  windowMessageSubject = new Subject<any>();
  numWindowsSubject = new Subject<any>();
  cssSubject = new Subject<any>();
  fileData: string[];
  numWindows: any;
  checkNumWindowsInterval: any;
  public planIdSubject = new Subject<number>();
  public loadingSubject = new Subject<boolean>();

  constructor(private router: Router, private ngZone: NgZone) {
    this.windowName = '';
    this.fileData = [];
    ipcRenderer.on('message-for-unset-window', (event, message) => this.unsetWindowMessage(event, message));
    ipcRenderer.on('num-windows', (event, arg) => {
      this.numWindows = arg;
      this.numWindowsSubject.next(this.numWindows);
    });
    this.checkNumWindowsInterval = setInterval(() => {
      if (this.numWindows === 2) {
        clearInterval(this.checkNumWindowsInterval); 
      } else {
        ipcRenderer.send('check-num-windows');
      }
    }, 100);

    ipcRenderer.on('is-main', (event, arg) => {
      if (arg) {
        this.setAsMainWindow();
      }
    });

    ipcRenderer.on('is-map', (event, arg) => {
      if (arg) {
        this.setAsMapWindow();
      }
    });
    ipcRenderer.send('is-this-main');
    ipcRenderer.send('is-this-map');
    ipcRenderer.on('plan-id-from-main', (event, arg) => {
      this.planIdSubject.next(arg);
    });
  }

  public getNumWindows(): any {
    return this.numWindows;
  }

  public notifyMain_planIsSet(plan: number) {
    ipcRenderer.send('main-plan-listener', plan);
  }

  public changeIsland(islandId: number) {
    this.notifyMain_planIsSet(islandId);
    this.resetAllWindows();
  }
 
  public setAsMainWindow() {
    this.windowName = 'main';
    ipcRenderer.removeListener('message-for-unset-window', () => { });
    ipcRenderer.send('message-to-unset-window', { type: 'set-window', windowName: 'map' });
    ipcRenderer.on('message-for-main-window', (event, message) => this.mainWindowMessage(event, message));
    ipcRenderer.send('set-main-window');
    this.ngZone.run(() => {
      this.router.navigate(['main-window']);
    });
  }

  public setAsMapWindow() {
    this.windowName = 'map';
    ipcRenderer.removeListener('message-for-unset-window', () => { });
    ipcRenderer.send('message-to-unset-window', { type: 'set-window', windowName: 'main' });
    ipcRenderer.send('set-map-window');
    ipcRenderer.on('message-for-map-window', (event, message) => this.mapWindowMessage(event, message));
    this.ngZone.run(() => {
      this.router.navigate(['map-window']);
    });
  }

  public removeWindow() {
    ipcRenderer.send('remove-window', 'remove');
    
  }

  public isMain(): boolean {
    return this.windowName === 'main';
  }

  public getPlanID(): void {
    ipcRenderer.send('get-plan-id');
  }

  private mapWindowMessage(event: Electron.IpcRendererEvent, data: any) {
    this.resetCheck(data.reset);
    this.windowMessageSubject.next(data);
  }

  private mainWindowMessage(event: Electron.IpcRendererEvent, data: any) {
    this.resetCheck(data.reset);
    this.windowMessageSubject.next(data);
  }

  private unsetWindowMessage(event: Electron.IpcRendererEvent, data: any) {
    this.resetCheck(data.reset);
    if (data.type === 'set-window' && this.windowName === '') {
      if (data.windowName === 'map') {
        this.setAsMapWindow();
      } else if (data.windowNAme === 'main') {
        this.setAsMainWindow();
      }
    }
  }


  public sendMessage(data: any) {
    if (this.windowName == 'map') {
      ipcRenderer.send('message-to-main-window', data);
    } else if (this.windowName == 'main') {
      ipcRenderer.send('message-to-map-window', data);
    }
  }

  public resetAllWindows() {
    this.resetCheck(true);
    ipcRenderer.send('clear-window-selections', {});
  }

  private resetCheck(value: boolean) {
    if (value) {
      this.loadingSubject.next(true);
      if (this.windowName === 'main') {
        setTimeout( ()=> {
          window.location.reload();
        }, 2000);
      } else {
        window.location.reload();
      }
      setTimeout(() => {
        this.loadingSubject.next(false);
      }, 2200);  
    }
  }

  public closeAppliction() {
    ipcRenderer.send('close');
  }

  public saveFile(data: { filename: string, file: any }): boolean {
    try {
      ipcRenderer.send('saveFile', data);
      return true;
    } catch (error) {
      return false;
    }
  }

  public loadFile(fileUrl: string) {
    ipcRenderer.send('loadFile', fileUrl);
    ipcRenderer.on('fileLoaded', (event, message) => {
      this.fileData.push(JSON.parse(message));
      ipcRenderer.removeListener('fileLoaded', () => { });
      if (JSON.parse(message).file === 'cssData') {
        this.cssSubject.next(JSON.parse(message).css);
      }
    }
    );
  }

  public getFileData(): void {
    this.sendMessage({ type: 'file information', message: this.fileData });
  }

  public getCssFileData(): any {
    return this.fileData[0];
  }
}
