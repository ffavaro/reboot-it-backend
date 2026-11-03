export type RolPunto = 'origen' | 'parada' | 'destino';

export interface Coordenada {
  lat: number;
  lng: number;
}

export interface PuntoRuta {
  rol: RolPunto;
  indice: number | null;
  direccion: string;
}

export interface MapaRuta {
  polyline: string;
  puntos: Coordenada[];
}

export interface RutaCalculada {
  orden: number[];
  kmEstimados: number | null;
  duracionMinutos: number | null;
  mapsUrl: string | null;
  embedUrl: string | null;
  mapa: MapaRuta | null;
  origen: string | null;
  puntos: PuntoRuta[];
  optimizada: boolean;
  advertencia?: string;
}

export interface ResultadoGoogle {
  km: number;
  minutos: number | null;
  mapa: MapaRuta | null;
  ordenIntermedias: number[] | null;
}

export interface Parada {
  direccion: string;
  indice: number;
}

export interface Configuracion {
  base: string;
  apiKey: string;
  embedKey: string;
  kmAlerta: number;
}

export interface RetiroConfirmado {
  turnoId: number;
  constanciaId: number | null;
  hojaFinalizada: boolean;
}