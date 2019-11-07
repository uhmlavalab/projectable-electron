export interface Map {
  name: string;
  description: string;
  bounds: [[number, number], [number, number]];
  mapLayers: MapLayer[];
}

export interface MapLayer {
  name: string;
  description: string;
  filePath: string;
  iconPath: string;
  imagePath: string;
  active: boolean;
  fillColor: string;
  borderColor: string;
  borderWidth: number;
}

export interface CSVData {
  name: string;
  description: string;
  filePath: string;
}

export interface Scenario {
  name: string;
  description: string;
  csvData: CSVData[];
  map: Map;
  timeSteps: Date[];
}

export interface Plan {
  name: string;
  description: string;
}
