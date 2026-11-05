export interface DireccionGeo {
  etiqueta: string;
  calle: string | null;
  numero: string | null;
  localidad: string | null;
  provincia: string | null;
  lat: number;
  lng: number;
}

export interface ResultadoGeocode {
  formatted_address: string;
  address_components: Array<{ long_name: string; types: string[] }>;
  geometry: { location: { lat: number; lng: number } };
}

export interface RespuestaGeocode {
  status: string;
  results: ResultadoGeocode[];
  error_message?: string;
}


export interface UbicacionGoogle {
  latLng?: { latitude: number; longitude: number };
}

export interface RespuestaGoogle {
  routes?: Array<{
    distanceMeters?: number;
    duration?: string;
    optimizedIntermediateWaypointIndex?: number[];
    polyline?: { encodedPolyline?: string };
    legs?: Array<{
      startLocation?: UbicacionGoogle;
      endLocation?: UbicacionGoogle;
    }>;
  }>;
  error?: { status?: string; message?: string };
}