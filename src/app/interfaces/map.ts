import { MapLayer } from './mapLayer';

export interface Map {
  scale: number;
  miniMapScale: number;
  width: number;
  height: number;
  bounds: [[number, number], [number, number]];
  baseMapPath: string;
  mapLayers: MapLayer[];
}
