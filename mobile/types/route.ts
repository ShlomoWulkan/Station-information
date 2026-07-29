/** קו שעוצר בתחנה — מ-GET /routes/<code>. */
export interface StationRoute {
  lineNumber: string;
  destination: string;
}

/** תחנה במסלול קו — מ-GET /route-stops/<code>/<line>. */
export interface RouteStop {
  id: string;
  code: string;
  name: string;
  lat: number;
  lon: number;
  sequence: number;
  isCurrent?: boolean;
}
