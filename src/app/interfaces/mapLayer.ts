import { PlanService } from '@app/services/plan.service';

export interface MapLayer {
  name: string;
  displayName: string;
  filePath: string;
  iconPath: string;
  secondScreenImagePath: string;
  secondScreenText: string;
  active: boolean;
  included: boolean;
  fillColor: string;
  borderColor: string;
  borderWidth: number;
  legendColor: string;
  parcels: Parcel[];
  legend: { text: string, color: string, textColor: string }[];
  setupFunction(planService: PlanService, state: number): any | null;
  updateFunction(planService: PlanService, state: number): any | null;
}

export interface Parcel {
  path: any;
  properties: any;
}
