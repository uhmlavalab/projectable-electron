import { Plan } from '@app/interfaces';
import { mapLayerColors, chartColors } from '../defaultColors';
import { PlanService } from '@app/services/plan.service';
import * as d3 from 'd3';

export const BigIslandPlan: Plan = {
  name: 'Big Island',
  displayName: 'Big Island',
  landingImagePath: 'assets/plans/bigisland/images/landing-image.jpg',
  secondScreenImagePath: 'assets/plans/bigisland/images/second-screen-images/backgrounds/bigIsland.jpg',
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
    capacityPath: 'assets/plans/bigisland/data/capacity.csv',
    generationPath: 'assets/plans/bigisland/data/generation.csv',
    batteryPath: 'assets/plans/bigisland/data/battery.csv',
    curtailmentPath: 'assets/plans/oahu-heco/data/curtailment.csv',
    colors: chartColors
  },
  map: {
    scale: 0.26,
    miniMapScale: 0.15,
    width: 2179,
    height: 2479,
    bounds: [[-156.0618, 20.2696], [-154.8067, 18.9105]],
    baseMapPath: 'assets/plans/bigisland/images/base-map.png',
    baseMiniMapPath: 'assets/plans/bigisland/images/bi-mini.png',
    mapLayers: [
      {
        name: 'transmission',
        displayName: 'Transmission Lines',
        active: false,
        included: true,
        iconPath: 'assets/plans/bigisland/images/icons/TRANSMISSION.png',
        secondScreenImagePath: 'assets/plans/oahu-heco/images/second-screen-images/layer-images/transmission.jpg',
        secondScreenText: 'This layer shows the high-voltage electric transmission system for the island of Hawai\'i. Transmission is important for moving bulk power from utility-scale generation to load centers.',
        fillColor: mapLayerColors.Transmission.fill,
        borderColor: mapLayerColors.Transmission.border,
        borderWidth: 0.04,
        legendColor: mapLayerColors.Transmission.border,
        filePath: 'assets/plans/bigisland/layers/transmission.json',
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
              .style('display', state ? 'block' : 'none');
          });
        },
        legend: [{ text: 'Transmission Lines', color: mapLayerColors.Transmission.border }]
      },
      {
        name: 'dod',
        displayName: 'Government Lands',
        active: false,
        included: true,
        iconPath: 'assets/plans/bigisland/images/icons/GOVERNMENT.png',
        secondScreenImagePath: 'assets/plans/oahu-heco/images/second-screen-images/layer-images/dod.jpg',
        secondScreenText: 'This layer shows land owned by different levels of government including Federal, State, County, and DHHL.',
        fillColor: mapLayerColors.Dod.fill,
        borderColor: mapLayerColors.Dod.border,
        borderWidth: 1,
        legendColor: mapLayerColors.Dod.fill,
        filePath: 'assets/plans/bigisland/layers/government.json',
        parcels: [],
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
              .style('display', state ? 'block' : 'none');
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
        name: 'solar',
        displayName: 'Solar',
        active: false,
        included: true,
        iconPath: 'assets/plans/bigisland/images/icons/SOLAR.png',
        secondScreenImagePath: 'assets/plans/oahu-heco/images/second-screen-images/layer-images/solar.jpg',
        secondScreenText: 'This layer represents the technical potential of solar based on analysis by the National Renewable Energy Laboratory that accounts for solar irradiance, zoning and use, and slope. The analysis estimates that there is potential for 2970 MW of utility scale solar. This layer fills in orange based on the highest capacity factor.',
        fillColor: mapLayerColors.Solar.fill,
        borderColor: mapLayerColors.Solar.border,
        borderWidth: 0.5,
        legendColor: mapLayerColors.Solar.fill,
        filePath: 'assets/plans/bigisland/layers/solar.json',
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
                .style('display', 'none')
                .style('opacity', 0.85)
                .style('stroke', this.borderColor)
                .style('stroke-width', this.borderWidth + 'px');
            }
          });
        },
        updateFunction(planService: PlanService, state) {
          let solarTotal = planService.getGenerationTotalForCurrentYear(['PV']);
          this.parcels.forEach((parcel, index) => {
            if (!planService.isMainWindow() || index % 7 === 0) {
              if (solarTotal > 0) {
                d3.select(parcel.path)
                  .style('fill', this.fillColor)
                  .style('display', state ? 'block' : 'none');
                solarTotal -= (parcel.properties.cf_1 * parcel.properties.capacity * 8760);
              } else {
                d3.select(parcel.path)
                  .style('fill', 'transparent')
                  .style('display', state ? 'block' : 'none');
              }
            }
          });
        },
        legend: [
          { text: 'Viable land for solar energy ', color: 'white' },
          { text: 'Land Area required to meet solar energy goal', color: mapLayerColors.Solar.fill }
        ],
      },
      {
        name: 'wind',
        displayName: 'Wind Energy',
        active: false,
        included: true,
        iconPath: 'assets/plans/bigisland/images/icons/WIND.png',
        secondScreenImagePath: 'assets/plans/oahu-heco/images/second-screen-images/layer-images/wind.jpg',
        secondScreenText: 'This layer represents this technical potential of solar based on an analysis by the National Renewable Energy Laboratory that accounts for the wind resource by location.',
        fillColor: mapLayerColors.Wind.fill,
        borderColor: mapLayerColors.Wind.border,
        borderWidth: .05,
        legendColor: mapLayerColors.Wind.fill,
        filePath: 'assets/plans/bigisland/layers/wind.json',
        parcels: [],
        setupFunction(planService: PlanService) {
          let windTotal = planService.getCapacityTotalForCurrentYear(['Wind']);
          this.parcels.sort((a, b) => parseFloat(b.properties.MWac) - parseFloat(a.properties.MWac));
          this.parcels.forEach(parcel => {
            if (windTotal > 0) {
              d3.select(parcel.path)
                .style('fill', this.fillColor)
                .style('opacity', 0.85)
                .style('display', 'none')
                .style('stroke', this.borderColor)
                .style('stroke-width', this.borderWidth + 'px');
              windTotal -= (parcel.properties.MWac * 0.2283 * 8760);
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
          let windTotal = planService.getGenerationTotalForCurrentYear(['Wind']);
          this.parcels.forEach((parcel, index) => {
            if (!planService.isMainWindow() || index % 7 === 0) {
              if (windTotal > 0) {
                d3.select(parcel.path)
                  .style('fill', this.fillColor)
                  .style('display', state ? 'block' : 'none');
                windTotal -= (parcel.properties.MWac * 0.2283 * 8760);
              } else {
                d3.select(parcel.path)
                  .style('fill', 'transparent')
                  .style('display', state ? 'block' : 'none');
              }
            }
          });
        },
        legend: [
          { text: 'Viable land for wind energy ', color: 'white' },
          { text: 'Land Area required to meet wind energy goal', color: mapLayerColors.Wind.fill }
        ],
      },
      {
        name: 'agriculture',
        displayName: 'Ag Lands',
        active: false,
        included: true,
        iconPath: 'assets/plans/bigisland/images/icons/AG.png',
        secondScreenImagePath: 'assets/plans/oahu-heco/images/second-screen-images/layer-images/agriculture.jpg',
        secondScreenText: 'This layer shows the Land Study Bureau’s Overall Productivity Rating (LSB) for agricultural lands. The ratings of the land move from Class A (most productive) to Class E (least productive). ',
        fillColor: mapLayerColors.Agriculture.fill,
        borderColor: mapLayerColors.Agriculture.border,
        borderWidth: 1,
        legendColor: mapLayerColors.Agriculture.fill,
        filePath: 'assets/plans/bigisland/layers/agriculture.json',
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
              .style('opacity', 0.85)
              .style('display', 'none')
              .style('stroke', this.borderColor)
              .style('stroke-width', this.borderWidth + 'px');
          });
        },
        updateFunction(planService: PlanService, state) {
          this.parcels.forEach(parcel => {
            d3.select(parcel.path)
              .style('display', state ? 'block' : 'none');
          });
        },
        legend: [
          { text: 'Class A Lands', color: '#7de87d' },
          { text: 'Class B Lands', color: '#2edd2e' },
          { text: 'Class C Lands', color: '#00d100' },
          { text: 'Class D Lands', color: '#009300' },
          { text: 'Class E Lands', color: '#005400' },
        ]
      }
    ],
  }
};
