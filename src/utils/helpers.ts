
 export const FORMATO_FECHA = new Intl.DateTimeFormat('es-AR', {
  timeZone: 'America/Argentina/Cordoba',
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

export const decimalANumero = {
  to: (valor: number | null) => valor,
  from: (valor: string | null) => (valor === null ? null : Number(valor)),
};

export const ESTADO_HOJA = {
  PENDIENTE: 'Pendiente',
  EN_PROCESO: 'En proceso',
  FINALIZADA: 'Finalizada',
} as const;

export const ESTADOS_HOJA = Object.values(ESTADO_HOJA);

export const ESTADOS_TURNO_POR_RETIRAR = ['asignado', 'retiro confirmado'];

export const MAX_DIAS_CONSULTA = 31;
export const MAX_PARADAS_INTERMEDIAS = 25;
export const CACHE_MS = 15 * 60 * 1000;
export const KM_ALERTA_POR_DEFECTO = 300;
export const MAX_SUGERENCIAS = 5;
export const MIN_CARACTERES = 3;
export const MAX_CARACTERES = 200;

export function quedaPorRetirar(estadoTurno?: string | null): boolean {
  return ESTADOS_TURNO_POR_RETIRAR.includes((estadoTurno ?? '').toLowerCase());
}

export function aFechaLocal(fecha: Date): string {
  const dos = (n: number) => String(n).padStart(2, '0');
  return `${fecha.getFullYear()}-${dos(fecha.getMonth() + 1)}-${dos(fecha.getDate())}`;
}

export function hoy(): string {
  return aFechaLocal(new Date());
}

export const ESTADO_ASIGNADO = 'Asignado';
export const ESTADO_DONACION_EN_PROCESO = 'En proceso';
export const ESTADO_EN_CLASIFICACION = 'En Clasificacion';
export const CONDICION_PENDIENTE = 'Pendiente de Clasificar';