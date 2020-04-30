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
    { category: 'logos', name: 'heco' }
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
    miniMapScale: 0.1,
    width: 3613,
    height: 2794,
    bounds: [[-156.6969, 21.03142], [-155.9788, 20.5746]],
    baseMapPath: 'assets/plans/maui/images/base-map.png',
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
              .style('opacity', this.active ? 0.85 : 0.0)
              .style('stroke', this.borderColor)
              .style('stroke-width', (this.borderWidth * parcel.properties.Voltage_kV) + 'px');
          });
        },
        updateFunction(planService: PlanService, state) {
          this.parcels.forEach(parcel => {
            d3.select(parcel.path)
              .style('opacity', state ? 0.85 : 0.0);
          });
        },
        legend: [{ text: 'Transmission Lines', color: mapLayerColors.Transmission.border }],
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
              .style('opacity', this.active ? 0.85 : 0.0)
              .style('stroke', this.borderColor)
              .style('stroke-width', this.borderWidth + 'px');
          });
        },
        updateFunction(planService: PlanService, state) {
          this.parcels.forEach(parcel => {
            d3.select(parcel.path)
              .style('opacity', state ? 0.85 : 0.0);
          });
        },
        legend: [
          { text: 'Federal Land', color: '#e60000' },
          { text: 'State Land', color: '#ff7f7f' },
          { text: 'Department of Hawaiian Homelands', color: '#895a44' },
          { text: 'County Land', color: '#00c5ff' },
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
        legend: [{ text: 'Park Lands', color: mapLayerColors.Parks.fill }],
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
          let windTotal = planService.getCapacityTotalForCurrentYear(['Wind']) / 3 - 72;
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
                .style('opacity', (this.active) ? 0.85 : 0.0)
                .style('stroke', this.borderColor)
                .style('stroke-width', this.borderWidth + 'px');
              windTotal -= (parcel.properties.MWac);
            } else {
              d3.select(parcel.path)
                .style('fill', 'transparent')
                .style('opacity', (this.active) ? 0.85 : 0.0)
                .style('stroke', this.borderColor)
                .style('stroke-width', this.borderWidth + 'px');
            }
          });
        },
        updateFunction(planService: PlanService, state) {
          let windTotal = planService.getCapacityTotalForCurrentYear(['Wind']) / 3 - 72;
          this.parcels.forEach(parcel => {
            if (windTotal > 0) {
              d3.select(parcel.path)
                .style('fill', this.fillColor)
                .style('opacity', state ? 0.85 : 0.0);
              windTotal -= (parcel.properties.MWac);
            } else {
              d3.select(parcel.path)
                .style('fill', 'transparent')
                .style('opacity', state ? 0.85 : 0.0);
            }
          });
        },
        legend: [
          { text: 'Viable land for wind energy ', color: 'white' },
          { text: 'Land Area required to meet wind energy goal', color: mapLayerColors.Wind.fill }
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
                .style('opacity', (this.active) ? 0.85 : 0.0)
                .style('stroke', this.borderColor)
                .style('stroke-width', this.borderWidth + 'px');
              solarTotal -= (parcel.properties.cf_1 * parcel.properties.capacity * 8760);
            } else {
              d3.select(parcel.path)
                .style('fill', 'transparent')
                .style('opacity', (this.active) ? 0.85 : 0.0)
                .style('stroke', this.borderColor)
                .style('stroke-width', this.borderWidth + 'px');
            }
          });
        },
        updateFunction(planService: PlanService, state) {
          let solarTotal = planService.getGenerationTotalForCurrentYear(['PV']);
          console.log(solarTotal);
          this.parcels.forEach(parcel => {
            if (solarTotal > 0) {
              d3.select(parcel.path)
                .style('fill', this.fillColor)
                .style('opacity', state ? 0.85 : 0.0);
              solarTotal -= (parcel.properties.cf_1 * parcel.properties.capacity * 8760);
            } else {
              d3.select(parcel.path)
                .style('fill', 'transparent')
                .style('opacity', state ? 0.85 : 0.0);
            }
          });
        },
        legend: [
          { text: 'Viable land for solar energy ', color: 'white' },
          { text: 'Land Area required to meet solar energy goal', color: mapLayerColors.Solar.fill }
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
            A: '#267300' + 'aa',
            B: '#4ce600' + 'aa',
            C: '#ffaa00' + 'aa',
            D: '#a87000' + 'aa',
            E: '#895a44' + 'aa',
          };
          this.parcels.forEach(parcel => {
            d3.select(parcel.path)
              .style('fill', colors[parcel.properties.type])
              .style('opacity', this.active ? 0.85 : 0.0)
              .style('stroke', this.borderColor)
              .style('stroke-width', this.borderWidth + 'px');
          });
        },
        updateFunction(planService: PlanService, state) {
          this.parcels.forEach(parcel => {
            d3.select(parcel.path)
              .style('opacity', state ? 0.85 : 0.0);
          });
        },
        legend: [
          { text: 'Class A Lands', color: '#7de87d' },
          { text: 'Class B Lands', color: '#2edd2e' },
          { text: 'Class C Lands', color: '#00d100' },
          { text: 'Class D Lands', color: '#009300' },
          { text: 'Class E Lands', color: '#005400' },
        ],
      },
    ],
  },

};
