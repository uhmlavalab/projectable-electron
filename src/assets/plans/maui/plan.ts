import { Plan } from '@app/interfaces';
import { mapLayerColors, chartColors } from '../defaultColors';
import { PlanService } from '@app/services/plan.service';
import * as d3 from 'd3';

export const MauiPlan: Plan = {
  name: 'maui',
  displayName: 'Maui',
  landingImagePath: 'assets/plans/maui/images/landing-image.jpg',
  secondScreenImagePath: 'assets/plans/maui/images/second-screen-images/backgrounds/maui.jpg',
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
  route: 'map-main',
  pucks: true,
  touch: false,
  scenarios: [
    {
      name: 'postapril',
      displayName: 'Post April',
    },
    {
      name: 'e3',
      displayName: 'E3'
    }
  ],
  data: {
    capacityPath: 'assets/plans/maui/data/capacity.csv',
    generationPath: 'assets/plans/maui/data/generation.csv',
    batteryPath: 'assets/plans/maui/data/battery.csv',
    curtailmentPath: 'assets/plans/oahu-heco/data/curtailment.csv',
    colors: chartColors
  },

  map: {
    scale: 0.258,
    miniMapScale: 0.10,
    width: 3613,
    height: 2794,
    bounds: [[-156.656958, 21.057764], [-156.022083, 20.473471]],
    baseMapPath: 'assets/plans/maui/images/maui-small.webp',
    baseMiniMapPath: 'assets/plans/maui/images/maui-mini-eva.png',
    mapLayers: [
      {
        name: 'transmission',
        displayName: 'Transmission Lines',
        active: false,
        included: true,
        iconPath: 'assets/plans/maui/images/icons/TRANSMISSION.png',
        secondScreenImagePath: 'assets/plans/oahu-heco/images/second-screen-images/layer-images/transmission.jpg',
        secondScreenText: 'This layer shows the high-voltage electric transmission system for the island of Maui. Transmission is important for moving bulk power from utility-scale generation to load centers.',
        fillColor: mapLayerColors.Transmission.fill,
        borderColor: mapLayerColors.Transmission.border,
        borderWidth: 0.04,
        legendColor: mapLayerColors.Transmission.border,
        filePath: 'assets/plans/maui/layers/transmission.json',
        parcels: [],
        setupFunction(planService: PlanService) {
          this.parcels.forEach(parcel => {
            d3.select(parcel.path)
              .style('fill', this.fillColor)
              .style('opacity', 0.85)
              .style('display', 'none')
              .style('stroke', this.borderColor)
              .style('stroke-width', (this.borderWidth * parcel.properties.Voltage_kV) + 'px');
          });
        },
        updateFunction(planService: PlanService, state) {
          this.parcels.forEach(parcel => {
            d3.select(parcel.path)
              .style('display', state === 1 ? 'block' : 'none');
          });
        },
        legend: [{ text: 'Transmission Lines', color: mapLayerColors.Transmission.border, textColor: 'black' }],
      },
      {
        name: 'dod',
        displayName: 'Government Lands',
        active: false,
        included: true,
        iconPath: 'assets/plans/maui/images/icons/GOVERNMENT.png',
        secondScreenImagePath: 'assets/plans/oahu-heco/images/second-screen-images/layer-images/dod.jpg',
        secondScreenText: 'This layer shows land owned by different levels of government including Federal, State, County, and DHHL.',
        fillColor: mapLayerColors.Dod.fill,
        borderColor: mapLayerColors.Dod.border,
        borderWidth: 1,
        legendColor: mapLayerColors.Dod.fill,
        parcels: [],
        filePath: 'assets/plans/maui/layers/dod.json',
        setupFunction(planService: PlanService) {
          const colors = {
            'Public-Federal': '#e60000',
            'Public-State': '#ff7f7f',
            'Public-State DHHL': '#895a44',
            'Public-County': '#00c5ff',
          };
          this.parcels.forEach(parcel => {
            d3.select(parcel.path)
              .style('fill', colors[parcel.properties.type])
              .style('opacity', 0.85)
              .style('display', 'none')
              .style('stroke', this.borderColor)
              .style('stroke-width', this.borderWidth + 'px');
          });
        },
        updateFunction(planService: PlanService, state) {
          this.parcels.forEach(parcel => {
            d3.select(parcel.path)
              .style('display', state === 1 ? 'block' : 'none');
          });
        },
        legend: [
          { text: 'Federal Land', color: '#e60000', textColor: 'black' },
          { text: 'State Land', color: '#ff7f7f', textColor: 'black' },
          { text: 'Department of Hawaiian Homelands', color: '#895a44', textColor: 'black' },
          { text: 'County Land', color: '#00c5ff', textColor: 'black' },
        ]
      },
      {
        name: 'parks',
        displayName: 'Park Lands',
        active: false,
        included: true,
        iconPath: 'assets/plans/maui/images/icons/PARK.png',
        secondScreenImagePath: 'assets/plans/oahu-heco/images/second-screen-images/layer-images/parks.jpg',
        secondScreenText: 'This layer shows the location of park lands on the island of Maui.',
        fillColor: mapLayerColors.Parks.fill,
        borderColor: mapLayerColors.Parks.border,
        borderWidth: 1,
        legendColor: mapLayerColors.Parks.fill,
        parcels: [],
        filePath: 'assets/plans/maui/layers/parks.json',
        setupFunction: null,
        updateFunction: null,
        legend: [{ text: 'Park Lands', color: mapLayerColors.Parks.fill, textColor: 'black' }],
      },
      {
        name: 'wind',
        displayName: 'Wind Energy',
        active: false,
        included: true,
        iconPath: 'assets/plans/maui/images/icons/WIND.png',
        secondScreenImagePath: 'assets/plans/oahu-heco/images/second-screen-images/layer-images/wind.jpg',
        secondScreenText: 'This layer represents this technical potential of solar based on an analysis by the National Renewable Energy Laboratory that accounts for the wind resource by location.',
        fillColor: mapLayerColors.Wind.fill,
        borderColor: mapLayerColors.Wind.border,
        borderWidth: 0.15,
        legendColor: mapLayerColors.Wind.fill,
        filePath: 'assets/plans/maui/layers/wind.json',
        parcels: [],
        setupFunction(planService: PlanService) {
          //let windTotal = planService.getCapacityTotalForCurrentYear(['Wind']) / 3 - 72;
          let windTotal = planService.getCapacityTotalForCurrentYear(['Wind']);
          const dictSort = {
            '8.5+': 0,
            '7.5-8.5': 1,
            '6.5-7.5': 2
          };
          this.parcels.sort((a, b) => parseFloat(dictSort[a.properties.SPD_CLS]) - parseFloat(dictSort[b.properties.SPD_CLS]));
          this.parcels.forEach(parcel => {
            if (windTotal > 0) {
              d3.select(parcel.path)
                .style('fill', this.fillColor)
                .style('opacity', 0.85)
                .style('display', 'none')
                .style('stroke', this.borderColor)
                .style('stroke-width', this.borderWidth + 'px');
              windTotal -= (parcel.properties.MWac);
            } else {
              d3.select(parcel.path)
                .style('fill', 'transparent')
                .style('opacity', 0.85)
                .style('display', 'none')
                .style('stroke', this.borderColor)
                .style('stroke-width', this.borderWidth + 'px');
            }
          });
        },
        updateFunction(planService: PlanService, state) {
          //let windTotal = planService.getCapacityTotalForCurrentYear(['Wind']) / 3 - 72;
          let windTotal = planService.getCapacityTotalForCurrentYear(['Wind']) - 72;
          const interval = planService.isMainWindow() ? Math.round(this.parcels.length / 2000) : 1;
          this.parcels.forEach((parcel, index) => {
            if (index % interval === 0) {
              if (windTotal > 0) {
                d3.select(parcel.path)
                  .style('fill', this.fillColor)
                  .style('display', state === 1 ? 'block' : 'none');
                windTotal -= (parcel.properties.MWac);
              } else {
                d3.select(parcel.path)
                  .style('fill', 'transparent')
                  .style('display', state === 1 ? 'block' : 'none');
              }
            }
          });
        },
        legend: [
          { text: 'Viable land for wind energy ', color: 'white', textColor: 'black' },
          { text: 'Land Area required to meet wind energy goal', color: mapLayerColors.Wind.fill, textColor: 'black' }
        ],
      },
      {
        name: 'solar',
        displayName: 'Solar',
        active: false,
        included: true,
        iconPath: 'assets/plans/maui/images/icons/SOLAR.png',
        secondScreenImagePath: 'assets/plans/oahu-heco/images/second-screen-images/layer-images/solar.jpg',
        secondScreenText: 'This layer represents the technical potential of solar based on analysis by the National Renewable Energy Laboratory that accounts for solar irradiance, zoning and use, and slope. The analysis estimates that there is potential for 2970 MW of utility scale solar. This layer fills in orange based on the highest capacity factor.',
        fillColor: mapLayerColors.Solar.fill,
        borderColor: mapLayerColors.Solar.border,
        borderWidth: 0.3,
        legendColor: mapLayerColors.Solar.fill,
        filePath: 'assets/plans/maui/layers/solar.json',
        parcels: [],
        setupFunction(planService: PlanService) {
          let solarTotal = planService.getGenerationTotalForCurrentYear(['PV']);
          this.parcels.sort((a, b) => parseFloat(b.properties.cf_1) - parseFloat(a.properties.cf_1));
          this.parcels.forEach(parcel => {
            if (solarTotal > 0) {
              d3.select(parcel.path)
                .style('fill', this.fillColor)
                .style('opacity', 0.85)
                .style('display', 'none')
                .style('stroke', this.borderColor)
                .style('stroke-width', this.borderWidth + 'px');
              solarTotal -= (parcel.properties.cf_1 * parcel.properties.capacity * 8760);
            } else {
              d3.select(parcel.path)
                .style('fill', 'transparent')
                .style('opacity', 0.85)
                .style('display', 'none')
                .style('stroke', this.borderColor)
                .style('stroke-width', this.borderWidth + 'px');
            }
          });
        },
        updateFunction(planService: PlanService, state) {
          let solarTotal = planService.getGenerationTotalForCurrentYear(['PV']);
          this.parcels.forEach((parcel, index) => {
            if (!planService.isMainWindow() || index % 4 === 0) {
              if (solarTotal > 0) {
                d3.select(parcel.path)
                  .style('fill', this.fillColor)
                  .style('display', state === 1 ? 'block' : 'none');
                solarTotal -= (parcel.properties.cf_1 * parcel.properties.capacity * 8760);
              } else {
                d3.select(parcel.path)
                  .style('fill', 'transparent')
                  .style('display', state === 1 ? 'block' : 'none');
              }
            }
          });
        },
        legend: [
          { text: 'Viable land for solar energy ', color: 'white' , textColor: 'black'},
          { text: 'Land Area required to meet solar energy goal', color: mapLayerColors.Solar.fill, textColor: 'black'}
        ],
      },
      {
        name: 'agriculture',
        displayName: 'Ag Lands',
        active: false,
        included: true,
        iconPath: 'assets/plans/maui/images/icons/AG.png',
        secondScreenImagePath: 'assets/plans/oahu-heco/images/second-screen-images/layer-images/agriculture.jpg',
        secondScreenText: 'This layer shows the Land Study Bureau’s Overall Productivity Rating (LSB) for agricultural lands. The ratings of the land move from Class A (most productive) to Class E (least productive). ',
        fillColor: chartColors.Battery,
        borderColor: mapLayerColors.Agriculture.border,
        borderWidth: 1,
        legendColor: mapLayerColors.Agriculture.fill,
        filePath: 'assets/plans/maui/layers/agriculture.json',
        parcels: [],
        setupFunction(planService: PlanService) {
          const colors = {
            A: '#7de87d' + 'aa',
            B: '#2edd2e' + 'aa',
            C: '#00d100' + 'aa',
            D: '#009300' + 'aa',
            E: '#005400' + 'aa',
          };
          this.parcels.forEach(parcel => {
            d3.select(parcel.path)
              .style('fill', colors[parcel.properties.type])
              .style('opacity', 0.85)
              .style('display', 'none')
              .style('stroke', this.borderColor)
              .style('stroke-width', this.borderWidth + 'px');
          });
        },
        updateFunction(planService: PlanService, state) {
          this.parcels.forEach(parcel => {
            d3.select(parcel.path)
              .style('display', state === 1 ? 'block' : 'none');
          });
        },
        legend: [
          { text: 'Class A Lands', color: '#7de87d', textColor: 'black' },
          { text: 'Class B Lands', color: '#2edd2e', textColor: 'black' },
          { text: 'Class C Lands', color: '#00d100', textColor: 'black' },
          { text: 'Class D Lands', color: '#009300', textColor: 'black' },
          { text: 'Class E Lands', color: '#005400', textColor: 'black' },
        ],
      },
    ],
  },

};
