export interface Station {
  id: string;
  name: string;
  code: string;
  lat?: number;
  lon?: number;
  distance?: number;
}

export interface BusArrival {
  lineNumber: string;
  destination: string;
  minutesUntilArrival: number;
  isRealTime: boolean;
}

export interface Route {
  lineNumber: string;
  operatorName: string;
  color?: string;
}
