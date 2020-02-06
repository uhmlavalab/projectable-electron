import { TouchPoint } from '@app/classes/touchpoint';
import { Cluster } from '@app/classes/cluster';

export interface TouchData {
    touchList: { [key: string]: TouchPoint };
    clusters: { [key: string]: Cluster[] };
    clicks: Touch[];
}
