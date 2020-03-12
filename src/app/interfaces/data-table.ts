import { Plan } from './plan';
import { Scenario } from './scenario';

export interface DataTable {

    state: number;
    plan: {
        current: Plan;
        isSet: boolean;
        name: string;
    };
    map: {
        scale: number;
        miniScale: number;
        width: number;
        height: number;
        bounds: any;
        path: string;
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
        all: any[];
    };
    components: string[];
    data: {
        generationPath: any;
        curtailmentPath: any;
        capacityPath: any;
        generation: any;
        capacity: any;
        curtailment: any;
        tech: any[];
    };
    positionData: any;

}
