import { Plan } from './plan';
import { Scenario } from './scenario';
import { MapLayer } from '@app/interfaces';
import { MapElement } from './map-element';

export interface DataTable {

    state: number;
    plan: {
        current: Plan;
        isSet: boolean;
        name: string;
        displayName: string;
    };
    map: {
        scale: number;
        miniScale: number;
        width: number;
        height: number;
        bounds: any;
        path: string;
        miniMapPath: string;
    };
    year: {
        all: number[];
        current: number;
        currentRenewablePercent: number;
        max: number;
        min: number;
    };
    renewableTotals: any[];
    scenario: {
        all: Scenario[],
        current: Scenario;
        name: string;
        display: string;
        currentIndex: number;
    };
    layers: {
        all: {layer: MapLayer, state: number}[];
    };
    components: MapElement[];
    data: {
        generationPath: any;
        curtailmentPath: any;
        capacityPath: any;
        generation: any;
        capacity: any;
        curtailment: any;
        tech: any[];
    };
    positionData: {
        locations: any;
        percents: any;
    };
    visibility: {
        lava: boolean;
        map: boolean;
        heco: boolean;
        data: boolean;
        pie: boolean;
        line: boolean;
    }
}
