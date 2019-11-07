import { Injectable } from '@angular/core';
import { MultiWindowService } from 'ngx-multi-window';
import { _ } from 'underscore';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
/** Contains the functions and data for controlling the second monitor */
export class WindowService {

  private secondScreenObject: any; // Stores the object of the second window
  private secondScreenSet: boolean; // True if the screen his open, false if not.
  private loadingStatus: boolean; // True if loading, false if not (for loading-screen after close window)
  public loadingSubject = new Subject<boolean>();


  constructor(private multiWindowService: MultiWindowService) {
    this.secondScreenObject = null;
    this.secondScreenSet = false;
  }

  /** Gets the native window object
   * @return the native window object
   */
  public getNativeWindow() {
    return window;
  }

  public getMultiWindowService(): MultiWindowService {
    return this.multiWindowService;
  }

  /** This function sets the object for a second screen.
   * @param object => The second screen object
   */
  public setSecondSceenObject(object: any): void {
    this.secondScreenSet = true;
    this.secondScreenObject = object;
  }

  /** Checks to see if the second screen has already been created.
   * @return true if set, false if not
   */
  public secondScreenIsSet(): boolean {
    return this.secondScreenSet;
  }

  /** Closes the second screen
   */
  public closeSecondScreen(): void {
    if (this.secondScreenIsSet) {
      this.secondScreenSet = false;
      this.secondScreenObject.close();

    }
  }

  /** This function recieves the message.  Can be called from anywhere.  Forwards message
   * to the second screen.
   * @param message => the json object string
   * @return true if successful, false if failed.
   */
  public notifySecondScreen(message: string): boolean {
    if (this.secondScreenIsSet()) {
      try {
        this.sendMessageToSecondScreen(this.getSecondScreenId(), message);
        return true;
      } catch (error) {
        return false;
      }
    }
  }
  /** Searches through the known windows and finds the second screen window.
   * @return the id of the window
   */
  private getSecondScreenId(): string {
    try {
      const recipient = _.filter(this.multiWindowService.getKnownWindows(), window => window.name === 'secondScreen');
      return recipient[0].id;
    } catch (error) {
      return null;
    }
  }

  /** Checks to see if the second screen can be found.
   * @return true if second screen is found, false otherwise.
   */
  public secondScreenExists(): boolean {
    if (this.getSecondScreenId()) {
      return true;
    } else {
      return false;
    }
  }

  /** Sends data to the second screen component when changes are made to the main application
   * @param screenId => The multi window screen id of second screen
   * @param messageData => The data
   */
  private sendMessageToSecondScreen(screenId: string, messageData: string): void {
    this.multiWindowService.sendMessage(screenId, 'customEvent', messageData).subscribe(
      (messageId: string) => {
       // console.log('Message send, ID is ' + messageId);
      },
      (error) => {
        console.log('Message sending failed, error: ' + error);
        /* If the message fails due to timeout because of an error with the windows
         * not closed yet.  Keep trying until it works */
        if (JSON.parse(messageData).type === 'setup') {
          this.notifySecondScreen(messageData);
        }
      },
      () => {
        //console.log('Message successfully delivered');
      });
  }

  /** Called by landing page when the landing page initializes.
   * @return the current landing page loading status.
   */
  public getLoadingStatus(): boolean {
    return this.loadingStatus;
  }
}
