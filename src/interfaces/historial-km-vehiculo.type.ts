export interface UsoVehiculo {
  id: number;
  patente: string;
  marca: string;
  modelo: string;
  kmTotales: number;
  cantidadRecorridos: number;
}

export interface FilaUso {
  id: string;
  patente: string;
  marca: string;
  modelo: string;
  kmTotales: string | null;
  cantidadRecorridos: string;
}