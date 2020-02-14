import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { landingButtons } from '../../assets/defaultData/content/landingButtons.js';
import { Plans } from '../../assets/plans/plans';
import { Plan } from '@app/interfaces/plan.js';
import { helpButtons, keyboardControls } from '../../assets/defaultData/content/helpContent.js';

@Injectable({
  providedIn: 'root'
})
export class ContentDeliveryService {

  // Content Delivery Publishers
  public landingRouteSubject = new Subject<any>(); // Determines which content is displayed
  constructor() { }

  /** Returns content for the landing buttons */
  getLandingButtonContent(): any {
    return landingButtons;
  }

  routeLanding(route): void {
    this.landingRouteSubject.next(route);  // Publish route to display
  }
  
  /** Gets all plans
   * @return array of all plans
   */
  public getPlans(): Plan[] {
    return Plans;
  }

  public getKeyboardControls(): any {
    return keyboardControls;
  }

  public getHelpButtons(): any {
    return helpButtons;
  }

  /* Math/Trig Functions */
  /** Adjusts the angle calculation depending on quadrant
   * @theta the angle as calculated by the arc tan function
   * @quadrant the quadrant of the unit circle
   */
  public adjustTheta(theta, quadrant) {
    theta = theta;
    if (quadrant === 2) {
      theta = 180 - theta;
    } else if (quadrant === 3) {
      theta = 180 + theta;
    } else if (quadrant === 4) {
      theta = 360 - theta;
    }
    return theta;
  }

  /** Get the quadrant of the unit circle
   * @param x the distance from the origin along x axis
   * @param y the distance from the origin along the y axis
   */
  public getQuadrant(x: number, y: number) {
    let quadrant = 0;
    if (x <= 0 && y <= 0) {
      quadrant = 2;
    } else if (x > 0 && y <= 0) {
      quadrant = 1;
    } else if (x >= 0 && y > 0) {
      quadrant = 4;
    } else {
      quadrant = 3;
    }
    return quadrant;
  }
  public convertRadsToDegrees(theta): number {
    return theta * (180 / Math.PI);
  }

  public getTheta(opposite: number, adjacent: number): number {
    return Math.atan(opposite / adjacent);
  }

  public getAdjacent(a: number, b: number): number {
    return Math.abs(a - b);
  }

  public getOpposite(a: number, b: number): number {
    return Math.abs(a - b);
  }

  public getHypotenuse(a: number, b: number): number {
    return Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2));
  }

}
