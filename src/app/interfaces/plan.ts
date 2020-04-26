import { Map } from './map';
import { Scenario } from './scenario';
import { MapElement } from './map-element';

export interface Plan {
  name: string;
  displayName: string;
  landingImagePath: string;
  secondScreenImagePath: string;
  includeSecondScreen: boolean;
  selectedPlan: boolean;
  mapElements: MapElement[];
  minYear: number;
  maxYear: number;
  scenarios: Scenario[];
  route: string;
  pucks: boolean;
  touch: boolean;
  data: {
    capacityPath: string;
    generationPath: string;
    batteryPath: string;
    curtailmentPath: string;
    colors: object;
  };
  map: Map;
}
