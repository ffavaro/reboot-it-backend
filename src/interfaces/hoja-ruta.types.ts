import { Coordenada, RolPunto } from './ruta.types';

export interface ParadaHojaRuta {
  turnoId: number;
  orden: number;
  donante: string;
  direccion: string;
  sinDireccion: boolean;
  fechaHora: Date;
  estadoTurno: string;
  retirado: boolean;
  constanciaId: number | null;
}

export interface PuntoRecorrido {
  rol: RolPunto;
  etiqueta: string;
  direccion: string;
  donante: string | null;
}

export interface ResumenHoja {
  id: number;
  estado: string;
  fechaInicio: Date | null;
  fechaFin: Date | null;
  kmInicial: number | null;
  kmFinal: number | null;
  kmReales: number | null;
  kmEstimado: number | null;
}

export interface HojaRutaDia {
  empleadoTransportistaId: number;
  transportista: { nombre: string; apellido: string } | null;
  vehiculo: {
    id: number;
    patente: string;
    marca: string;
    modelo: string;
    kilometraje: number | null;
  } | null;
  fecha: string;
  estado: string;
  paradas: ParadaHojaRuta[];
  cantidadPedidos: number;
  kmEstimados: number | null;
  duracionMinutos: number | null;
  mapsUrl: string | null;
  embedUrl: string | null;
  mapa: { polyline: string; puntos: Coordenada[] } | null;
  recorrido: PuntoRecorrido[];
  origen: string | null;
  rutaOptimizada: boolean;
  advertencia?: string;
  hojaRuta: ResumenHoja | null;
}

export interface HojaRutaHistorico {
  id: number;
  fecha: string;
  empleadoTransportistaId: number;
  transportista: string;
  vehiculo: {
    id: number;
    patente: string;
    marca: string;
    modelo: string;
  } | null;
  cantidadPedidos: number;
  kmEstimados: number | null;
  kmInicial: number | null;
  kmFinal: number | null;
  kmReales: number | null;
  fechaInicio: Date | null;
  fechaFin: Date | null;
  estado: string;
}
