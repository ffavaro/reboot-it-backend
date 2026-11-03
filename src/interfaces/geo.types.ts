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

