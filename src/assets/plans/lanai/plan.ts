import { Plan } from '@app/interfaces';
import { mapLayerColors, chartColors } from '../defaultColors';
import { PlanService } from '@app/services/plan.service';
import * as d3 from 'd3';

export const LanaiPlan: Plan = {
  name: 'lanai',
  displayName: 'Lanai',
  landingImagePath: 'assets/plans/lanai/images/Lanai.png',
  secondScreenImagePath: 'assets/plans/lanai/images/Lanai.png',
  includeSecondScreen: false,
  selectedPlan: false,
  mapElements: [
    { category: 'map', name: 'map' },
    { category: 'data', name: 'data' },
    { category: 'charts', name: 'line' },
    { category: 'charts', name: 'pie' },
    { category: 'logos', name: 'lava' },
    { category: 'logos', name: 'heco' },
    { category: 'legend', name: 'legend' }
  ],
  minYear: 2016,
  maxYear: 2045,
  route: 'heco-main',
  pucks: false,
  touch: true,
  scenarios: [
    {
      name: 'postapril',
      displayName: 'Post April',
    }
  ],
  data: {
    capacityPath: '',
    generationPath: '',
    batteryPath: '',
    curtailmentPath: '',
    colors: chartColors
  },
  map: {
    scale: .256,
    miniMapScale: 0.1,
    width: 3613,
    height: 2794,
    bounds: [[-157.0764697, 20.9463350], [-156.7873579, 20.7180950]],
    baseMapPath: 'assets/plans/lanai/images/bing_sat.png',
    baseMiniMapPath: 'assets/plans/lanai/images/bing_sat.png',
    mapLayers: [
      {
        name: 'hunting',
        displayName: 'Hunting Lands',
        active: false,
        included: true,
        iconPath: 'assets/plans/lanai/images/icons/hunt.png',
        secondScreenImagePath: 'assets/plans/oahu-heco/images/second-screen-images/layer-images/parks.jpg',
        secondScreenText: 'This layer displays the hunting lands on Lanai.',
        fillColor: mapLayerColors.Parks.fill,
        borderColor: mapLayerColors.Parks.border,
        borderWidth: 1,
        legendColor: mapLayerColors.Parks.fill,
        parcels: [],
        filePath: 'assets/plans/lanai/layers/hunting.json',
        setupFunction: null,
        updateFunction: null,
        legend: [{ text: 'Hunting Lands', color: mapLayerColors.Parks.fill, textColor: 'black' }],
      },
      {
        name: 'boating',
        displayName: 'Boating Facilities',
        active: false,
        included: true,
        iconPath: 'assets/plans/lanai/images/icons/boat.png',
        secondScreenImagePath: 'assets/plans/oahu-heco/images/second-screen-images/layer-images/ship.jpg',
        secondScreenText: 'This layer displays the hunting lands on Lanai.',
        fillColor: mapLayerColors.Transmission.border,
        borderColor: mapLayerColors.Parks.border,
        borderWidth: 1,
        legendColor: mapLayerColors.Transmission.border,
        parcels: [],
        filePath: 'assets/plans/lanai/layers/boating.json',
        setupFunction: null,
        updateFunction: null,
        legend: [{ text: 'Hunting Lands', color: mapLayerColors.Transmission.border, textColor: 'black' }],
      },
      {
        name: 'elevation',
        displayName: 'Elevation Contours',
        active: false,
        included: true,
        iconPath: 'assets/plans/lanai/images/icons/mountain.png',
        secondScreenImagePath: 'assets/plans/oahu-heco/images/second-screen-images/layer-images/ship.jpg',
        secondScreenText: 'This layer displays the hunting lands on Lanai.',
        fillColor: 'transparent',
        borderColor: 'white',
        borderWidth: 1,
        legendColor: 'white',
        parcels: [],
        filePath: 'assets/plans/lanai/layers/elevation.json',
        setupFunction: null,
        updateFunction: null,
        legend: [{ text: 'Hunting Lands', color: mapLayerColors.Transmission.border, textColor: 'black' }],
      },
      {
        name: 'ahupuaa',
        displayName: 'Ahupuaa Boundaries',
        active: false,
        included: true,
        iconPath: 'assets/plans/lanai/images/icons/pin.png',
        secondScreenImagePath: 'assets/plans/oahu-heco/images/second-screen-images/layer-images/pin.png',
        secondScreenText: 'This layer displays the hunting lands on Lanai.',
        fillColor: 'transparent',
        borderColor: 'orange',
        borderWidth: 1,
        legendColor: 'green',
        parcels: [],
        filePath: 'assets/plans/lanai/layers/ahupuaa.json',
        setupFunction: null,
        updateFunction: null,
        legend: [{ text: 'Hunting Lands', color: mapLayerColors.Transmission.border, textColor: 'black' }],
      },
      {
        name: 'reefs',
        displayName: 'Coral Reefs',
        active: false,
        included: true,
        iconPath: 'assets/plans/lanai/images/icons/coral.png',
        secondScreenImagePath: 'assets/plans/oahu-heco/images/second-screen-images/layer-images/coral.png',
        secondScreenText: 'This layer displays the hunting lands on Lanai.',
        fillColor: 'transparent',
        borderColor: 'orange',
        borderWidth: 3,
        legendColor: 'green',
        parcels: [],
        filePath: 'assets/plans/lanai/layers/reefs.json',
        setupFunction: null,
        updateFunction: null,
        legend: [{ text: 'Hunting Lands', color: mapLayerColors.Transmission.border, textColor: 'black' }],
      }
    ]
  }
};