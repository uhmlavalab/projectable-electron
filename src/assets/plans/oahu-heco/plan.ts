import { Plan } from '@app/interfaces';
import { mapLayerColors, chartColors } from '../defaultColors';
import { PlanService } from '@app/services/plan.service';
import * as d3 from 'd3';

export const HecoPlan: Plan = {
  name: 'heco-oahu',
  displayName: 'HECO-Oahu',
  landingImagePath: 'assets/plans/oahu-heco/images/landing-image.jpg',
  secondScreenImagePath: 'assets/plans/oahu-heco/images/second-screen-images/backgrounds/oahu-heco-renewable-background.jpg',
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
  route: 'heco-main',
  pucks: false,
  touch: true,
  scenarios: [
    {
      name: 'postapril',
      displayName: 'Post April',
    },
    {
      name: 'e3',
      displayName: 'E3'
    },
    {
      name: 'e3genmod',
      displayName: 'E3 Gen Mod'
    }
  ],
  data: {
    capacityPath: 'assets/plans/oahu-heco/data/capacity.csv',
    generationPath: 'assets/plans/oahu-heco/data/generation.csv',
    batteryPath: 'assets/plans/oahu-heco/data/battery.csv',
    curtailmentPath: 'assets/plans/oahu-heco/data/curtailment.csv',
    colors: chartColors
  },
  map: {
    scale: .256,
    miniMapScale: 0.1,
    width: 3613,
    height: 2794,
    bounds: [[-158.281, 21.710], [-157.647, 21.252]],
    baseMapPath: 'assets/plans/oahu-heco/images/oahu-satellite5.png',
    mapLayers: [
      {
        name: 'transmission',
        displayName: 'Transmission Lines',
        active: false,
        included: true,
        iconPath: 'assets/plans/oahu-heco/images/icons/TRANSMISSION.png',
        secondScreenImagePath: 'assets/plans/oahu-heco/images/second-screen-images/layer-images/transmission.jpg',
        secondScreenText: 'This layer shows the high-voltage electric transmission system for the island of Oahu. Transmission is important for moving bulk power from utility-scale generation to load centers.',
        fillColor: mapLayerColors.Transmission.fill,
        borderColor: mapLayerColors.Transmission.border,
        borderWidth: 0.02,
        legendColor: mapLayerColors.Transmission.border,
        filePath: 'assets/plans/oahu-heco/layers/transmission.json',
        parcels: [],
        setupFunction(planService: PlanService, state) {
          this.parcels.forEach(parcel => {
            d3.select(parcel.path)
              .style('fill', this.fillColor)
              .style('opacity', state === 1 ? 0.85 : 0.0)
              .style('display', state === 1 ? 'block' : 'none')
              .style('stroke', this.borderColor)
              .style('stroke-width', (this.borderWidth * parcel.properties.Voltage_kV) + 'px');
          });
        },
        updateFunction(planService: PlanService, state) {
          this.parcels.forEach(parcel => {
            d3.select(parcel.path)
              .style('display', state === 1 ? 'block' : 'none')
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
        iconPath: 'assets/plans/oahu-heco/images/icons/GOVERNMENT.png',
        secondScreenImagePath: 'assets/plans/oahu-heco/images/second-screen-images/layer-images/dod.jpg',
        secondScreenText: 'This layer shows land owned by different levels of government including Federal, State, County, and DHHL.',
        fillColor: mapLayerColors.Dod.fill,
        borderColor: mapLayerColors.Dod.border,
        borderWidth: 1,
        legendColor: mapLayerColors.Dod.fill,
        filePath: 'assets/plans/oahu-heco/layers/government.json',
        parcels: [],
        setupFunction(planService: PlanService, state) {
          const colors = {
            'Public-Federal': '#e60000',
            'Public-State': '#ff7f7f',
            'Public-State DHHL': '#895a44',
            'Public-County': '#00c5ff',
          };
          this.parcels.forEach(parcel => {
            d3.select(parcel.path)
              .style('fill', colors[parcel.properties.type])
              .style('display', state === 1 ? 'block' : 'none')
              .style('opacity', state === 1 ? 0.85 : 0.0)
              .style('stroke', this.borderColor)
              .style('stroke-width', this.borderWidth + 'px');
          });
        },
        updateFunction(planService: PlanService, state) {
          this.parcels.forEach(parcel => {
            d3.select(parcel.path)
              .style('display', state === 1 ? 'block' : 'none')
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
        iconPath: 'assets/plans/oahu-heco/images/icons/PARK.png',
        secondScreenImagePath: 'assets/plans/oahu-heco/images/second-screen-images/layer-images/parks.jpg',
        secondScreenText: 'This layer shows the location of park lands on Oahu.',
        fillColor: mapLayerColors.Parks.fill,
        borderColor: mapLayerColors.Parks.border,
        borderWidth: 1,
        legendColor: mapLayerColors.Parks.fill,
        filePath: 'assets/plans/oahu-heco/layers/parks.json',
        parcels: [],
        setupFunction: null,
        updateFunction: null,
        legend: [{ text: 'Park Lands', color: mapLayerColors.Parks.fill }],
      },
      {
        name: 'existing_re',
        displayName: 'Existing Renewables',
        active: false,
        included: true,
        iconPath: 'assets/plans/oahu-heco/images/icons/RENEW.png',
        secondScreenImagePath: 'assets/plans/oahu-heco/images/second-screen-images/layer-images/existing_re.jpg',
        secondScreenText: 'This layer represents the renewable energy sources on Oahu as of 2016.',
        fillColor: mapLayerColors.Existing_RE.fill,
        borderColor: mapLayerColors.Existing_RE.border,
        borderWidth: 1,
        legendColor: mapLayerColors.Existing_RE.fill,
        filePath: 'assets/plans/oahu-heco/layers/existing_re.json',
        parcels: [],
        setupFunction: null,
        updateFunction: null,
        legend: [{ text: 'Existing Renewables', color: mapLayerColors.Existing_RE.fill }],
      },
      {
        name: 'wind',
        displayName: 'Wind Energy',
        active: false,
        included: true,
        iconPath: 'assets/plans/oahu-heco/images/icons/WIND.png',
        secondScreenImagePath: 'assets/plans/oahu-heco/images/second-screen-images/layer-images/wind.jpg',
        secondScreenText: 'This layer represents this technical potential of solar based on an analysis by the National Renewable Energy Laboratory that accounts for the wind resource by location.',
        fillColor: mapLayerColors.Wind.fill,
        borderColor: mapLayerColors.Wind.border,
        borderWidth: 0.2,
        legendColor: mapLayerColors.Wind.fill,
        filePath: 'assets/plans/oahu-heco/layers/wind.json',
        parcels: [],
        setupFunction(planService: PlanService, state: number) {
          let windTotal = planService.getCapacityTotalForCurrentYear(['Wind']) - 99;
          const dictSort = {
            '8.5+': 0,
            '7.5-8.5': 1,
            '6.5-7.5': 2
          };
          this.parcels.sort((a, b) => parseFloat(dictSort[a.properties.SPD_CLS]) - parseFloat(dictSort[b.properties.SPD_CLS]));
          this.parcels.sort((a, b) => parseFloat(b.properties.MWac) - parseFloat(a.properties.MWac));
          this.parcels.forEach(parcel => {
            if (windTotal > 0) {
              d3.select(parcel.path)
                .style('fill', this.fillColor)
                .style('display', state === 1 ? 'block' : 'none')
                .style('opacity', state === 1 ? 0.85 : 0.0)
                .style('stroke', this.borderColor)
                .style('stroke-width', this.borderWidth + 'px');
              windTotal -= (parcel.properties.MWac * 0.2283 * 8760);
            } else {
              d3.select(parcel.path)
                .style('fill', 'transparent')
                .style('display', state === 1 ? 'block' : 'none')
                .style('opacity', state === 1 ? 0.85 : 0.0)
                .style('stroke', this.borderColor)
                .style('stroke-width', this.borderWidth + 'px');
            }
          });
        },
        updateFunction(planService: PlanService, state: number) {
          let windTotal = planService.getCapacityTotalForCurrentYear(['Wind']) - 99;
          this.parcels.forEach(parcel => {
            if (windTotal > 0) {
              d3.select(parcel.path)
                .style('fill', this.fillColor)
                .style('display', state === 1 ? 'block' : 'none')
                .style('opacity', state ? 0.85 : 0.0);
              windTotal -= (parcel.properties.MWac * 0.2283 * 8760);
            } else {
              d3.select(parcel.path)
                .style('fill', 'transparent')
                .style('display', state === 1 ? 'block' : 'none')
                .style('opacity', state === 1 ? 0.85 : 0.0);
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
        displayName: 'Solar Energy',
        active: false,
        included: true,
        iconPath: 'assets/plans/oahu-heco/images/icons/SOLAR.png',
        secondScreenImagePath: 'assets/plans/oahu-heco/images/second-screen-images/layer-images/solar.jpg',
        secondScreenText: 'This layer represents the technical potential of solar based on analysis by the National Renewable Energy Laboratory that accounts for solar irradiance, zoning and use, and slope. The analysis estimates that there is potential for 2970 MW of utility scale solar. This layer fills in orange based on the highest capacity factor.',
        fillColor: mapLayerColors.Solar.fill,
        borderColor: mapLayerColors.Solar.border,
        borderWidth: 0.2,
        legendColor: mapLayerColors.Solar.fill,
        filePath: 'assets/plans/oahu-heco/layers/solar.json',
        parcels: [],
        setupFunction(planService: PlanService, state: number) {
          let solarTotal = planService.getGenerationTotalForCurrentYear(['PV']);
          const curtailmentTotal = planService.getCurtailmentTotalForCurrentYear(['PV']);
          solarTotal += curtailmentTotal;
          this.parcels.sort((a, b) => parseFloat(b.properties.cf_1) - parseFloat(a.properties.cf_1));
          this.parcels.forEach(parcel => {
            if (solarTotal > 0) {
              d3.select(parcel.path)
                .style('fill', this.fillColor)
                .style('display', state === 1 ? 'block' : 'none')
                .style('opacity', state === 1 ? 0.85 : 0.0)
                .style('stroke', this.borderColor)
                .style('stroke-width', this.borderWidth + 'px');
              solarTotal -= (parcel.properties.cf_1 * parcel.properties.capacity * 8760);
            } else {
              d3.select(parcel.path)
                .style('fill', 'transparent')
                .style('display', state === 1 ? 'block' : 'none')
                .style('opacity', state === 1 ? 0.85 : 0.0)
                .style('stroke', this.borderColor)
                .style('stroke-width', this.borderWidth + 'px');
            }
          });
        },
        updateFunction(planService: PlanService, state: number) {
          let solarTotal = planService.getGenerationTotalForCurrentYear(['PV']);
          const curtailmentTotal = planService.getCurtailmentTotalForCurrentYear(['PV']);
          solarTotal += curtailmentTotal;
          this.parcels.forEach((parcel, index) => {
            if (!planService.isMainWindow() || index % 5 === 0) {
              if (solarTotal > 0) {
                d3.select(parcel.path)
                  .style('fill', this.fillColor)
                  .style('display', state === 1 ? 'block' : 'none')
                  .style('opacity', state === 1 ? 0.85 : 0.0);
                solarTotal -= (parcel.properties.cf_1 * parcel.properties.capacity * 8760);
              } else {
                d3.select(parcel.path)
                  .style('fill', 'transparent')
                  .style('display', state === 1 ? 'block' : 'none')
                  .style('opacity', state === 1 ? 0.85 : 0.0);
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
        name: 'agriculture',
        displayName: 'Agricultural Lands',
        active: false,
        included: true,
        iconPath: 'assets/plans/oahu-heco/images/icons/AG.png',
        secondScreenImagePath: 'assets/plans/oahu-heco/images/second-screen-images/layer-images/agriculture.jpg',
        secondScreenText: 'This layer shows the Land Study Bureau’s Overall Productivity Rating (LSB) for agricultural lands. The ratings of the land move from Class A (most productive) to Class E (least productive). ',
        fillColor: mapLayerColors.Agriculture.fill,
        borderColor: mapLayerColors.Agriculture.border,
        borderWidth: 0.25,
        legendColor: mapLayerColors.Agriculture.fill,
        filePath: 'assets/plans/oahu-heco/layers/lsb2.json',
        parcels: [],
        setupFunction(planService: PlanService, state: number) {
          const colors = {
            'A': '#7de87d',
            'B': '#2edd2e',
            'C': '#00d100',
            'D': '#009300',
            'E': '#005400',
          };
          this.parcels.forEach(parcel => {
            d3.select(parcel.path)
              .style('fill', colors[parcel.properties.type])
              .style('opacity', state === 1 ? 0.85 : 0.0)
              .style('display', state === 1 ? 'block' : 'none')
              .style('stroke', this.borderColor)
              .style('stroke-width', this.borderWidth + 'px');
          });
        },
        updateFunction(planService: PlanService, state: number) {
          this.parcels.forEach(parcel => {
            d3.select(parcel.path)
              .style('display', state === 1 ? 'block' : 'none')
              .style('opacity', state === 1 ? 0.85 : 0.0);
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
      {
        name: 'ial',
        displayName: 'Important Agricultural Lands',
        active: false,
        included: true,
        iconPath: 'assets/plans/oahu-heco/images/icons/IAL.png',
        secondScreenImagePath: 'assets/plans/oahu-heco/images/second-screen-images/layer-images/solar.jpg',
        secondScreenText: 'This layer shows the intersection of the NREL solar potential layer and the proposed Important Agricultural Land area proposed by the City and County of Honolulu in 2018. This layer limits the solar layer from filling IAL parcels.',
        fillColor: mapLayerColors.Solar.fill,
        borderColor: mapLayerColors.Solar.border,
        borderWidth: 0.2,
        legendColor: mapLayerColors.Solar.fill,
        filePath: 'assets/plans/oahu-heco/layers/solar.json',
        parcels: [],
        setupFunction(planService: PlanService, state: number) {
          let solarTotal = planService.getGenerationTotalForCurrentYear(['PV']);
          const curtailmentTotal = planService.getCurtailmentTotalForCurrentYear(['PV']);
          solarTotal += curtailmentTotal;
          this.parcels.sort((a, b) => parseFloat(b.properties.cf_1) - parseFloat(a.properties.cf_1));
          this.parcels.forEach(parcel => {
            if (parcel.properties.IAL === 'Y') {
              d3.select(parcel.path)
                .style('fill', 'black')
                .style('opacity', state === 1 ? 0.85 : 0.0)
                .style('display', state === 1 ? 'block' : 'none')
                .style('stroke', this.borderColor)
                .style('stroke-width', this.borderWidth + 'px');
            } else if (solarTotal > 0) {
              d3.select(parcel.path)
                .style('fill', this.fillColor)
                .style('display', state === 1 ? 'block' : 'none')
                .style('opacity', state === 1 ? 0.85 : 0.0)
                .style('stroke', this.borderColor)
                .style('stroke-width', this.borderWidth + 'px');
              solarTotal -= (parcel.properties.cf_1 * parcel.properties.capacity * 8760);
            } else {
              d3.select(parcel.path)
                .style('fill', 'transparent')
                .style('display', state === 1 ? 'block' : 'none')
                .style('opacity', state === 1 ? 0.85 : 0.0)
                .style('stroke', this.borderColor)
                .style('stroke-width', this.borderWidth + 'px');
            }
          });
        },
        updateFunction(planService: PlanService, state: number) {
          let solarTotal = planService.getGenerationTotalForCurrentYear(['PV']);
          const curtailmentTotal = planService.getCurtailmentTotalForCurrentYear(['PV']);
          solarTotal += curtailmentTotal;
          this.parcels.forEach((parcel, index) => {
            if (!planService.isMainWindow() || index % 5 === 0) {
              if (parcel.properties.IAL === 'Y') {
                d3.select(parcel.path)
                  .style('fill', 'black')
                  .style('opacity', (state === 1) ? 0.85 : 0.0)
                  .style('display', state === 1 ? 'block' : 'none')
                  .style('stroke', this.borderColor)
                  .style('stroke-width', this.borderWidth + 'px');
              } else if (solarTotal > 0) {
                d3.select(parcel.path)
                  .style('fill', this.fillColor)
                  .style('display', state === 1 ? 'block' : 'none')
                  .style('opacity', (state === 1) ? 0.85 : 0.0);
                solarTotal -= (parcel.properties.cf_1 * parcel.properties.capacity * 8760);
              } else {
                d3.select(parcel.path)
                  .style('fill', 'transparent')
                  .style('display', state === 1 ? 'block' : 'none')
                  .style('opacity', state === 1 ? 0.85 : 0.0);
              }
            }
          });
        },
        legend: [
          { text: 'Land defined as Important Agriculture', color: 'black' },
          { text: 'Land necessary to meet solar energy goal', color: mapLayerColors.Solar.fill }
        ],
      },
      {
        name: 'der',
        displayName: 'Distributed Energy Resources',
        active: false,
        included: true,
        iconPath: 'assets/plans/oahu-heco/images/icons/distributed_energy.png',
        secondScreenImagePath: 'assets/plans/oahu-heco/images/second-screen-images/layer-images/solar.jpg',
        secondScreenText: 'This layer depicts the available locational capacity for distributed energy resources. The layer changes to red as DER from the PSIP plan is added to the available capacity.',
        fillColor: 'orange',
        borderColor: 'orange',
        borderWidth: .1,
        legendColor: 'orange',
        filePath: 'assets/plans/oahu-heco/layers/DERdata.json',
        parcels: [],
        setupFunction(planService: PlanService, state: number) {
          this.derColors = [
            {
              minValue: 0.75,
              color: '#f5f500',
            },
            {
              minValue: 0.675,
              color: '#f5da00',
            },
            {
              minValue: 0.6,
              color: '#f5be00',
            },
            {
              minValue: 0.525,
              color: '#f5a300',
            },
            {
              minValue: 0.45,
              color: '#f58800',
            },
            {
              minValue: 0.375,
              color: '#f56d00',
            },
            {
              minValue: 0.3,
              color: '#f55200',
            },
            {
              minValue: 0.15,
              color: '#f53600',
            },
            {
              minValue: 0.05,
              color: '#f51b00',
            },
            {
              minValue: 0.00,
              color: '#f50000',
            },
          ];

          this.capData = {};
          d3.csv('assets/plans/oahu-heco/data/DER_Group_Cap.csv', (data) => {
            data.forEach(element => {
              const id = element.GroupId.toString();
              const year = element.Year.toString();
              const value = Number(element.Value);
              if (!this.capData.hasOwnProperty(id)) {
                this.capData[id] = {};
              }
              if (!this.capData[id].hasOwnProperty(year)) {
                this.capData[id][year] = value;
              }
            });
            this.parcels.forEach(parcel => {
              const id = parcel.properties.Building_F.toString().split('_')[1];
              const year = (planService.getCurrentYear().current).toString();
              if (Number(year) >= 2018) {
                if (this.capData.hasOwnProperty(id)) {
                  const value = this.capData[id][year];
                  const color = () => {
                    let max = 1;
                    let min = 0;
                    for (let i = 0; i < this.derColors.length; i++) {
                      min = this.derColors[i].minValue;
                      if (value <= max && value >= min) {
                        return this.derColors[i].color;
                      }
                      max = min;
                    }
                    return this.derColors[this.derColors.length - 1].color;
                  };
                  d3.select(parcel.path)
                    .style('fill', color)
                    .style('display', state === 1 ? 'block' : 'none')
                    .style('opacity', state === 1 ? 0.85 : 0.0);
                }
              }
            });
          });
        },
        updateFunction(planService: PlanService, state: number) {
          this.parcels.forEach(parcel => {
            const id = parcel.properties.Building_F.toString().split('_')[1];
            const year = (planService.getCurrentYear().current).toString();
            if (Number(year) >= 2018) {
              if (this.capData.hasOwnProperty(id)) {
                const value = this.capData[id][year];
                const color = () => {
                  let max = 1;
                  let min = 0;
                  for (let i = 0; i < this.derColors.length; i++) {
                    min = this.derColors[i].minValue;
                    if (value <= max && value >= min) {
                      return this.derColors[i].color;
                    }
                    max = min;
                  }
                  return this.derColors[this.derColors.length - 1].color;
                };
                d3.select(parcel.path)
                  .style('fill', color)
                  .style('display', state === 1 ? 'block' : 'none')
                  .style('opacity', state === 1 ? 1.00 : 0.0);
              }
            }
          });
        },
        legend: [
          { text: 'The layer changes to red as DER is added.', color: 'linear-gradient(90deg, #f5f500 0%, #f5da00 11%, #f5be00 22%, #f5a300 33%, #f58800 44%, #f56d00 55%, #f55200 66%, #f53600 77%, #f51b00 88%, #f50000 100%)' }
        ],
      }
    ],
  }
};
