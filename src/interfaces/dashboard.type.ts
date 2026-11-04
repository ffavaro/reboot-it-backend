import { DashboardQueryDto } from '../dashboard/dto/create-dashboard.dto';
import { aFechaLocal } from '@app/utils/helpers';

const DIA_MS = 86_400_000;
export const SIN_TIPO = 'Sin tipo';
const MESES_POR_DEFECTO = 3;

export type Fila = Record<string, string | number | null>;

export interface Filtros {
  desde: string;
  hasta: string;
  donantes: number[];
}

export interface Condicion {
  sql: string;
  params: (string | number)[];
}

export const ETAPAS = [
  'espera',
  'clasificacion',
  'destruccionPallet',
  'certificacion',
] as const;

export type Etapa = (typeof ETAPAS)[number];

export interface FechasDonacion {
  registro: Date | string;
  retiro: Date | string | null;
  clasificacion: Date | string | null;
  pallet: Date | string | null;
  certificado: Date | string;
}

export interface Acumulador {
  suma: Record<Etapa, number>;
  cuenta: Record<Etapa, number>;
}

export type Destino = 'reutilizable' | 'reciclable' | 'desecho';

export const redondear = (valor: number, decimales = 1) =>
  Math.round(valor * 10 ** decimales) / 10 ** decimales;

export const porcentaje = (parte: number, total: number) =>
  total > 0 ? Math.round((parte / total) * 100) : null;

export function obtenerFiltros(
  query: DashboardQueryDto,
  hoy: Date = new Date(),
): Filtros {
  const inicio = new Date(hoy);
  inicio.setMonth(inicio.getMonth() - MESES_POR_DEFECTO);

  return {
    desde: aFechaLocal(inicio),
    hasta: aFechaLocal(hoy),
    donantes: (query.donanteIds ?? '').split(',').filter(Boolean).map(Number),
  };
}

export function entreFecha(columna: string, filtro: Filtros): Condicion {
  return {
    sql: `DATE(${columna}) BETWEEN ? AND ?`,
    params: [filtro.desde, filtro.hasta],
  };
}

export function filtrarDonantes(columna: string, filtro: Filtros): Condicion {
  if (!filtro.donantes.length) return { sql: '', params: [] };
  const marcas = filtro.donantes.map(() => '?').join(',');
  return { sql: ` AND ${columna} IN (${marcas})`, params: filtro.donantes };
}

export function destinoDe(condicion: string): Destino | null {
  if (/reutiliz/i.test(condicion)) return 'reutilizable';
  if (/recicl/i.test(condicion)) return 'reciclable';
  if (/desech/i.test(condicion)) return 'desecho';
  return null;
}

export const vacio = (): Acumulador => ({
  suma: { espera: 0, clasificacion: 0, destruccionPallet: 0, certificacion: 0 },
  cuenta: {
    espera: 0,
    clasificacion: 0,
    destruccionPallet: 0,
    certificacion: 0,
  },
});

export const diasEntre = (
  desde: Date | string | null,
  hasta: Date | string | null,
): number | null => {
  if (!desde || !hasta) return null;
  return Math.max(
    0,
    (new Date(hasta).getTime() - new Date(desde).getTime()) / DIA_MS,
  );
}

export const sumar = (destino: Acumulador, etapa: Etapa, dias: number | null) => {
  if (dias === null) return;
  destino.suma[etapa] += dias;
  destino.cuenta[etapa] += 1;
}

export const promedios = (acumulado: Acumulador): Record<Etapa, number> => {
  const resultado = {} as Record<Etapa, number>;
  for (const etapa of ETAPAS) {
    const cuenta = acumulado.cuenta[etapa];
    resultado[etapa] =
      cuenta > 0 ? redondear(acumulado.suma[etapa] / cuenta) : 0;
  }
  return resultado;
}

export const resumirCiclos = (filas: FechasDonacion[]) => {
  const porMes = new Map<string, Acumulador & { donaciones: number }>();
  const general = vacio();
  const duraciones: number[] = [];

  for (const fila of filas) {
    const total = diasEntre(fila.registro, fila.certificado);
    if (total !== null) duraciones.push(total);

    const etapas: Record<Etapa, number | null> = {
      espera: diasEntre(fila.registro, fila.retiro),
      clasificacion: diasEntre(fila.retiro, fila.clasificacion),
      destruccionPallet: diasEntre(fila.clasificacion, fila.pallet),
      certificacion: diasEntre(fila.pallet, fila.certificado),
    };

    const mes = aFechaLocal(new Date(fila.certificado)).slice(0, 7);
    const delMes = porMes.get(mes) ?? { ...vacio(), donaciones: 0 };
    delMes.donaciones += 1;

    for (const etapa of ETAPAS) {
      sumar(delMes, etapa, etapas[etapa]);
      sumar(general, etapa, etapas[etapa]);
    }
    porMes.set(mes, delMes);
  }

  const meses = [...porMes.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([mes, acumulado]) => {
      const etapas = promedios(acumulado);
      const total = redondear(
        ETAPAS.reduce((suma, etapa) => suma + etapas[etapa], 0),
      );
      return { mes, donaciones: acumulado.donaciones, ...etapas, total };
    });

  const indicador = duraciones.length
    ? {
      promedio: redondear(
        duraciones.reduce((a, b) => a + b, 0) / duraciones.length,
      ),
      min: redondear(Math.min(...duraciones)),
      max: redondear(Math.max(...duraciones)),
      donaciones: duraciones.length,
    }
    : null;

  return {
    indicador,
    porEtapa: {
      meses,
      promedio: promedios(general),
      donaciones: duraciones.length,
    },
  };
}

export function armarFiltros(
  query: DashboardQueryDto,
  hoy = new Date(),
): Filtros {
  const inicio = new Date(hoy);
  inicio.setMonth(inicio.getMonth() - MESES_POR_DEFECTO);

  return {
    desde: query.fechaDesde ?? aFechaLocal(inicio),
    hasta: query.fechaHasta ?? aFechaLocal(hoy),
    donantes: (query.donanteIds ?? '').split(',').filter(Boolean).map(Number),
  };
}


