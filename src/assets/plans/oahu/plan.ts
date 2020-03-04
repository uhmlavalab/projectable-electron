import { Plan } from '@app/interfaces';
import { mapLayerColors, chartColors } from '../defaultColors';
import { PlanService } from '@app/services/plan.service';
import * as d3 from 'd3';
import { ConvertPropertyBindingResult } from '@angular/compiler/src/compiler_util/expression_converter';

export const OahuPlan: Plan = {
  name: 'oahu',
  displayName: 'Oahu',
  landingImagePath: 'assets/plans/oahu/images/landing-image.jpg',
  secondScreenImagePath: 'assets/plans/oahu/images/second-screen-images/backgrounds/oahu-renewable-background.jpg',
  includeSecondScreen: false,
  selectedPlan: false,
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
    },
    {
      name: 'e3genmod',
      displayName: 'E3 Gen Mod'
    }
  ],
  data: {
    capacityPath: 'assets/plans/oahu/data/capacity.csv',
    generationPath: 'assets/plans/oahu/data/generation.csv',
    batteryPath: 'assets/plans/oahu/data/battery.csv',
    curtailmentPath: 'assets/plans/oahu/data/curtailment.csv',
    colors: chartColors
  },
  map: {
    scale: 0.256,
    miniMapScale: 0.1,
    width: 3613,
    height: 2794,
    bounds: [[-158.281, 21.710], [-157.647, 21.252]],
    baseMapPath: 'assets/plans/oahu/images/oahu-satellite5-smaller.png',
    mapLayers: [
      {
        name: 'transmission',
        displayName: 'Transmission Lines',
        active: false,
        included: true,
        iconPath: 'assets/plans/oahu/images/icons/transmission-icon.png',
        secondScreenImagePath: 'assets/plans/oahu/images/second-screen-images/layer-images/transmission.jpg',
        secondScreenText: 'This layer shows the high-voltage electric transmission system for the island of Oahu. Transmission is important for moving bulk power from utility-scale generation to load centers.',
        fillColor: mapLayerColors.Transmission.fill,
        borderColor: mapLayerColors.Transmission.border,
        borderWidth: 0.02,
        legendColor: mapLayerColors.Transmission.border,
        filePath: 'assets/plans/oahu/layers/transmission.json',
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
        updateFunction(planService: PlanService) {
          this.parcels.forEach(parcel => {
            d3.select(parcel.path)
              .style('opacity', this.active ? 0.85 : 0.0);
          });
        },
      },
      {
        name: 'dod',
        displayName: 'Government Lands',
        active: false,
        included: true,
        iconPath: 'assets/plans/oahu/images/icons/dod-icon.png',
        secondScreenImagePath: 'assets/plans/oahu/images/second-screen-images/layer-images/dod.jpg',
        secondScreenText: 'This layer shows land owned by different levels of government including Federal, State, County, and DHHL.',
        fillColor: mapLayerColors.Dod.fill,
        borderColor: mapLayerColors.Dod.border,
        borderWidth: 1,
        legendColor: mapLayerColors.Dod.fill,
        filePath: 'assets/plans/oahu/layers/government1.json',
        parcels: [],
        setupFunction(planService: PlanService) {
          const colors = {
            'Public-Federal': '#e60000',
            'Public-State': '#ff7f7f',
            'Public-State DHHL': '#895a44',
            'Public-County': '#00c5ff',
          }
          this.parcels.forEach(parcel => {
            d3.select(parcel.path)
              .style('fill', colors[parcel.properties.type])
              .style('opacity', this.active ? 0.85 : 0.0)
              .style('stroke', this.borderColor)
              .style('stroke-width', this.borderWidth + 'px');
          });
        },
        updateFunction(planService: PlanService) {
          this.parcels.forEach(parcel => {
            d3.select(parcel.path)
              .style('opacity', this.active ? 0.85 : 0.0);
          });
        },      },
      {
        name: 'parks',
        displayName: 'Park Lands',
        active: false,
        included: true,
        iconPath: 'assets/plans/oahu/images/icons/parks-icon.png',
        secondScreenImagePath: 'assets/plans/oahu/images/second-screen-images/layer-images/parks.jpg',
        secondScreenText: 'This layer shows the location of park lands on Oahu.',
        fillColor: mapLayerColors.Parks.fill,
        borderColor: mapLayerColors.Parks.border,
        borderWidth: 1,
        legendColor: mapLayerColors.Parks.fill,
        filePath: 'assets/plans/oahu/layers/parks.json',
        parcels: [],
        setupFunction: null,
        updateFunction: null,
      },
      {
        name: 'existing_re',
        displayName: 'Existing Renewables',
        active: false,
        included: true,
        iconPath: 'assets/plans/oahu/images/icons/existing_re-icon.png',
        secondScreenImagePath: 'assets/plans/oahu/images/second-screen-images/layer-images/existing_re.jpg',
        secondScreenText: 'This layer represents the renewable energy sources on Oahu as of 2016',
        fillColor: mapLayerColors.Existing_RE.fill,
        borderColor: mapLayerColors.Existing_RE.border,
        borderWidth: 1,
        legendColor: mapLayerColors.Existing_RE.fill,
        filePath: 'assets/plans/oahu/layers/existing_re.json',
        parcels: [],
        setupFunction: null,
        updateFunction: null,
      },
      {
        name: 'wind',
        displayName: 'Wind Energy',
        active: false,
        included: true,
        iconPath: 'assets/plans/oahu/images/icons/wind-icon.png',
        secondScreenImagePath: 'assets/plans/oahu/images/second-screen-images/layer-images/wind.jpg',
        secondScreenText: 'This layer shows land owned by different levels of government including Federal, State, County, and DHHL. ',
        fillColor: mapLayerColors.Wind.fill,
        borderColor: mapLayerColors.Wind.border,
        borderWidth: 0.2,
        legendColor: mapLayerColors.Wind.fill,
        filePath: 'assets/plans/oahu/layers/wind.json',
        parcels: [],
        setupFunction(planService: PlanService) {
          let windTotal = planService.getCapacityTotalForCurrentYear(['Wind']) - 99;
          const dictSort = {
            '8.5+': 0,
            '7.5-8.5': 1,
            '6.5-7.5': 2
          }
          this.parcels.sort((a, b) => parseFloat(dictSort[a.properties.SPD_CLS]) - parseFloat(dictSort[b.properties.SPD_CLS]));
          this.parcels.sort((a, b) => parseFloat(b.properties.MWac) - parseFloat(a.properties.MWac));
          this.parcels.forEach(parcel => {
            if (windTotal > 0) {
              d3.select(parcel.path)
                .style('fill', this.fillColor)
                .style('opacity', (this.active) ? 0.85 : 0.0)
                .style('stroke', this.borderColor)
                .style('stroke-width', this.borderWidth + 'px');
              windTotal -= (parcel.properties.MWac * 0.2283 * 8760);
            } else {
              d3.select(parcel.path)
                .style('fill', 'transparent')
                .style('opacity', (this.active) ? 0.85 : 0.0)
                .style('stroke', this.borderColor)
                .style('stroke-width', this.borderWidth + 'px');
            }
          });
        },
        updateFunction(planService: PlanService) {
          let windTotal = planService.getCapacityTotalForCurrentYear(['Wind']) - 99;
          this.parcels.forEach(parcel => {
            if (windTotal > 0) {
              d3.select(parcel.path)
                .style('fill', this.fillColor)
                .style('opacity', (this.active) ? 0.85 : 0.0);
              windTotal -= (parcel.properties.MWac * 0.2283 * 8760);
            } else {
              d3.select(parcel.path)
                .style('fill', 'transparent')
                .style('opacity', (this.active) ? 0.85 : 0.0);
            }
          });
        },
      },
      {
        name: 'solar',
        displayName: 'Solar',
        active: false,
        included: true,
        iconPath: 'assets/plans/oahu/images/icons/solar-icon.png',
        secondScreenImagePath: 'assets/plans/oahu/images/second-screen-images/layer-images/solar.jpg',
        secondScreenText: 'This layer represents the technical potential of solar based on analysis by the National Renewable Energy Laboratory that accounts for solar irradiance, zoning and use, and slope. The analysis estimates that there is potential for 2970 MW of utility scale solar. This layer fills in orange based on the highest capacity factor.',
        fillColor: mapLayerColors.Solar.fill,
        borderColor: mapLayerColors.Solar.border,
        borderWidth: 0.2,
        legendColor: mapLayerColors.Solar.fill,
        filePath: 'assets/plans/oahu/layers/solar.json',
        parcels: [],
        setupFunction(planService: PlanService) {
          let solarTotal = planService.getGenerationTotalForCurrentYear(['PV']);
          const curtailmentTotal = planService.getCurtailmentTotalForCurrentYear(['PV']);
          solarTotal += curtailmentTotal;
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
        updateFunction(planService: PlanService) {
          let solarTotal = planService.getGenerationTotalForCurrentYear(['PV']);
          const curtailmentTotal = planService.getCurtailmentTotalForCurrentYear(['PV']);
          solarTotal += curtailmentTotal;
          this.parcels.forEach(parcel => {
            if (solarTotal > 0) {
              d3.select(parcel.path)
                .style('fill', this.fillColor)
                .style('opacity', (this.active) ? 0.85 : 0.0);
              solarTotal -= (parcel.properties.cf_1 * parcel.properties.capacity * 8760);
            } else {
              d3.select(parcel.path)
                .style('fill', 'transparent')
                .style('opacity', (this.active) ? 0.85 : 0.0);
            }
          });
        },
      },
      {
        name: 'agriculture',
        displayName: 'Ag Lands',
        active: false,
        included: true,
        iconPath: 'assets/plans/oahu/images/icons/agriculture-icon.png',
        secondScreenImagePath: 'assets/plans/oahu/images/second-screen-images/layer-images/agriculture.jpg',
        secondScreenText: 'This layer shows the Land Study Bureau’s Overall Productivity Rating (LSB) for agricultural lands. The ratings of the land move from Class A (most productive) to Class E (least productive). ',
        fillColor: mapLayerColors.Agriculture.fill,
        borderColor: mapLayerColors.Agriculture.border,
        borderWidth: 1,
        legendColor: mapLayerColors.Agriculture.fill,
        filePath: 'assets/plans/oahu/layers/agriculture.json',
        parcels: [],
        setupFunction: null,
        updateFunction: null,
      },
      {
        name: 'ial',
        displayName: 'IAL',
        active: false,
        included: true,
        iconPath: 'assets/plans/oahu/images/icons/ial-icon.png',
        secondScreenImagePath: 'assets/plans/oahu/images/second-screen-images/layer-images/solar.jpg',
        secondScreenText: 'This layer shows the intersection of the NREL solar potential layer and the proposed Important Agricultural Land area proposed by the City and County of Honolulu in 2018. This layer limits the solar layer from filling IAL parcels.',
        fillColor: mapLayerColors.Solar.fill,
        borderColor: mapLayerColors.Solar.border,
        borderWidth: 0.2,
        legendColor: mapLayerColors.Solar.fill,
        filePath: 'assets/plans/oahu/layers/solar.json',
        parcels: [],
        setupFunction(planService: PlanService) {
          let solarTotal = planService.getGenerationTotalForCurrentYear(['PV']);
          const curtailmentTotal = planService.getCurtailmentTotalForCurrentYear(['PV']);
          solarTotal += curtailmentTotal;
          this.parcels.sort((a, b) => parseFloat(b.properties.cf_1) - parseFloat(a.properties.cf_1));
          this.parcels.forEach(parcel => {
            if (parcel.properties.IAL === "Y") {
              d3.select(parcel.path)
              .style('fill', 'black')
              .style('opacity', (this.active) ? 0.85 : 0.0)
              .style('stroke', this.borderColor)
              .style('stroke-width', this.borderWidth + 'px');
            }
            else if (solarTotal > 0) {
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
        updateFunction(planService: PlanService) {
          let solarTotal = planService.getGenerationTotalForCurrentYear(['PV']);
          const curtailmentTotal = planService.getCurtailmentTotalForCurrentYear(['PV']);
          solarTotal += curtailmentTotal;
          this.parcels.forEach(parcel => {
            if (parcel.properties.IAL === "Y") {
              d3.select(parcel.path)
              .style('fill', 'black')
              .style('opacity', (this.active) ? 0.85 : 0.0)
              .style('stroke', this.borderColor)
              .style('stroke-width', this.borderWidth + 'px');
            }
            else if (solarTotal > 0) {
              d3.select(parcel.path)
                .style('fill', this.fillColor)
                .style('opacity', (this.active) ? 0.85 : 0.0);
              solarTotal -= (parcel.properties.cf_1 * parcel.properties.capacity * 8760);
            } else {
              d3.select(parcel.path)
                .style('fill', 'transparent')
                .style('opacity', (this.active) ? 0.85 : 0.0);
            }
          });
        },
      },
      {
        name: 'der',
        displayName: 'Distributed Energy Resources',
        active: false,
        included: true,
        iconPath: 'assets/plans/oahu/images/icons/der.jpg',
        secondScreenImagePath: 'assets/plans/oahu/images/second-screen-images/layer-images/solar.jpg',
        secondScreenText: 'This layer depicts the available locational capacity for distributed energy resources. The layer changes to red as DER from the PSIP plan is added to the available capacity.',
        fillColor: 'orange',
        borderColor: 'orange',
        borderWidth: .1,
        legendColor: 'orange',
        filePath: 'assets/plans/oahu/layers/HECODER.json',
        parcels: [],
        setupFunction: null,
        updateFunction: null,
      }
    ],
  }
};
