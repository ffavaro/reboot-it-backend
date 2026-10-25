import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { DashboardQueryDto } from './dto/dashboard-query.dto';

const DIA_MS = 86_400_000;
const redondear = (n: number, d = 1) => Math.round(n * 10 ** d) / 10 ** d;
const pct = (parte: number, total: number) => (total > 0 ? Math.round((parte / total) * 100) : null);
const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

// Nombres de condición de material (catálogo fijo, ver common/constants/estados.ts)
const REUTILIZABLE = /reutiliz/i;
const RECICLABLE = /recicl/i;
const DESECHO = /desech/i;

interface Filtros {
  desde: string;
  hasta: string;
  donantes: number[];
}

/**
 * Indicadores y gráficos del dashboard. Cuentan lo que hay que hacer (trabajo pendiente) y cuánto tarda el circuito,
 * y cruzan tres o más variables. Todo sale de consultas agregadas: el frontend no recorre listas completas.
 * `completo` = false para el Técnico: solo ve lo de planta (lotes, clasificación y destrucción).
 */
@Injectable()
export class DashboardService {
  constructor(@InjectDataSource() private readonly ds: DataSource) {}

  private filtros(q: DashboardQueryDto): Filtros {
    const hoy = new Date();
    const desdeDefecto = new Date(hoy);
    desdeDefecto.setMonth(desdeDefecto.getMonth() - 3);
    return {
      desde: q.fechaDesde ?? iso(desdeDefecto),
      hasta: q.fechaHasta ?? iso(hoy),
      donantes: (q.donanteIds ?? '').split(',').filter(Boolean).map(Number),
    };
  }

  // "columna entre desde y hasta (inclusive)" con sus parámetros
  private rango(columna: string, f: Filtros): { sql: string; params: string[] } {
    return { sql: `${columna} >= ? AND ${columna} < DATE_ADD(?, INTERVAL 1 DAY)`, params: [f.desde, f.hasta] };
  }

  private donante(columna: string, f: Filtros): { sql: string; params: number[] } {
    return f.donantes.length
      ? { sql: ` AND ${columna} IN (${f.donantes.map(() => '?').join(',')})`, params: f.donantes }
      : { sql: '', params: [] };
  }

  async resumen(q: DashboardQueryDto, completo: boolean) {
    const f = this.filtros(q);
    const [pendiente, reutilizacion, kgProcesados, medios, destinoPorTipo, destruccionPorMetodoYMedio] = await Promise.all([
      this.trabajoPendiente(completo),
      this.reutilizacion(f),
      this.kgProcesados(f),
      this.mediosDestruidos(f),
      this.destinoPorTipo(f),
      this.destruccionPorMetodoYMedio(f),
    ]);

    if (!completo) {
      return {
        completo, desde: f.desde, hasta: f.hasta, pendiente, ciclo: null, reutilizacion, kgProcesados, medios,
        donantes: null, kmPorRetiro: null, retiroDomicilio: null,
        graficos: { cicloPorEtapa: null, destinoPorTipo, demandaTurnos: [], mapaDonantes: [], kgPorMesYTipo: [], destruccionPorMetodoYMedio, eficienciaRutas: [] },
      };
    }

    const [ciclos, donantes, kmPorRetiro, retiroDomicilio, demandaTurnos, mapaDonantes, kgPorMesYTipo, eficienciaRutas] = await Promise.all([
      this.ciclos(f),
      this.donantesRecurrentes(f),
      this.kmPorRetiro(f),
      this.retiroDomicilio(f),
      this.demandaTurnos(f),
      this.mapaDonantes(f),
      this.kgPorMesYTipo(f),
      this.eficienciaRutas(f),
    ]);
    return {
      completo, desde: f.desde, hasta: f.hasta, pendiente, ciclo: ciclos.indicador, reutilizacion, kgProcesados, medios,
      donantes, kmPorRetiro, retiroDomicilio,
      graficos: { cicloPorEtapa: ciclos.porEtapa, destinoPorTipo, demandaTurnos, mapaDonantes, kgPorMesYTipo, destruccionPorMetodoYMedio, eficienciaRutas },
    };
  }

  // ── Trabajo pendiente (foto de hoy, sin filtro de fechas) ─────────────────
  private async trabajoPendiente(completo: boolean) {
    const n = async (sql: string) => Number((await this.ds.query(sql))[0]?.n ?? 0);
    const [lotesPorClasificar, procesosAbiertos] = await Promise.all([
      n(`SELECT COUNT(DISTINCT l.id) n FROM lote l
         JOIN material m ON m.lote_id = l.id AND m.is_active = 1
         LEFT JOIN condicion_material c ON c.id = m.condicion_material_id
         WHERE l.is_active = 1 AND (m.condicion_material_id IS NULL OR c.condicion REGEXP 'definir|pendiente')`),
      n(`SELECT COUNT(*) n FROM proceso_destruccion p
         JOIN estado_proceso_destruccion e ON e.id = p.estado_id
         WHERE p.is_active = 1 AND e.nombre NOT REGEXP 'finaliz|complet|cancel|anulad'`),
    ]);
    if (!completo) return { turnosSinAsignarManana: null, lotesPorClasificar, procesosAbiertos, donacionesParaCertificar: null };
    const [turnosSinAsignarManana, donacionesParaCertificar] = await Promise.all([
      n(`SELECT COUNT(*) n FROM turno t JOIN estado_turno e ON e.id = t.estado_turno_id
         WHERE t.is_active = 1 AND DATE(t.fecha_hora) = DATE_ADD(CURDATE(), INTERVAL 1 DAY)
           AND t.empleado_id IS NULL AND t.empleado_transportista_id IS NULL
           AND e.descripcion NOT REGEXP 'cancel|finaliz|clasific'`),
      n(`SELECT COUNT(*) n FROM donacion d JOIN estado_donacion e ON e.id = d.estado_donacion_id
         WHERE d.is_active = 1 AND e.descripcion REGEXP 'certificado'`),
    ]);
    return { turnosSinAsignarManana, lotesPorClasificar, procesosAbiertos, donacionesParaCertificar };
  }

  // ── Indicadores del período ───────────────────────────────────────────────
  private async reutilizacion(f: Filtros) {
    const r = this.rango('m.created_at', f);
    const d = this.donante('d.donante_id', f);
    const filas: { condicion: string; n: string }[] = await this.ds.query(
      `SELECT c.condicion, COUNT(*) n FROM material m
       JOIN condicion_material c ON c.id = m.condicion_material_id
       LEFT JOIN lote l ON l.id = m.lote_id LEFT JOIN donacion d ON d.id = l.donacion_id
       WHERE m.is_active = 1 AND ${r.sql}${d.sql} GROUP BY c.condicion`,
      [...r.params, ...d.params],
    );
    let reutilizable = 0, reciclable = 0, desecho = 0;
    for (const x of filas) {
      const cant = Number(x.n);
      if (REUTILIZABLE.test(x.condicion)) reutilizable += cant;
      else if (RECICLABLE.test(x.condicion)) reciclable += cant;
      else if (DESECHO.test(x.condicion)) desecho += cant;
    }
    const total = reutilizable + reciclable + desecho;
    return { reutilizable, reciclable, desecho, total, pctReutilizable: pct(reutilizable, total), pctDesecho: pct(desecho, total) };
  }

  private async kgProcesados(f: Filtros): Promise<number> {
    const r = this.rango('l.created_at', f);
    const d = this.donante('d.donante_id', f);
    const filas = await this.ds.query(
      `SELECT COALESCE(SUM(l.peso_bruto_kg), 0) kg FROM lote l LEFT JOIN donacion d ON d.id = l.donacion_id
       WHERE l.is_active = 1 AND l.peso_bruto_kg IS NOT NULL AND ${r.sql}${d.sql}`,
      [...r.params, ...d.params],
    );
    return redondear(Number(filas[0]?.kg ?? 0), 1);
  }

  private async mediosDestruidos(f: Filtros) {
    const r = this.rango('p.created_at', f);
    const d = this.donante('d.donante_id', f);
    const filas = await this.ds.query(
      `SELECT COALESCE(SUM(e.nombre REGEXP 'finaliz|complet'), 0) finalizados, COUNT(*) total
       FROM proceso_destruccion p
       JOIN estado_proceso_destruccion e ON e.id = p.estado_id
       JOIN medio_almacenamiento ma ON ma.id = p.medio_almacenamiento_id
       LEFT JOIN material m ON m.id = ma.material_id LEFT JOIN lote l ON l.id = m.lote_id LEFT JOIN donacion d ON d.id = l.donacion_id
       WHERE p.is_active = 1 AND ${r.sql}${d.sql}`,
      [...r.params, ...d.params],
    );
    return { finalizados: Number(filas[0]?.finalizados ?? 0), total: Number(filas[0]?.total ?? 0) };
  }

  private async donantesRecurrentes(f: Filtros) {
    const r = this.rango('d.created_at', f);
    const d = this.donante('d.donante_id', f);
    const filas: { n: string }[] = await this.ds.query(
      `SELECT COUNT(*) n FROM donacion d WHERE d.is_active = 1 AND ${r.sql}${d.sql} GROUP BY d.donante_id`,
      [...r.params, ...d.params],
    );
    return { recurrentes: filas.filter((x) => Number(x.n) > 1).length, total: filas.length };
  }

  private async kmPorRetiro(f: Filtros) {
    const r = this.rango('h.fecha', f);
    const filas = await this.ds.query(
      `SELECT COALESCE(SUM(h.km_estimados), 0) km, COALESCE(SUM(h.cantidad_pedidos), 0) retiros FROM hoja_ruta h
       WHERE h.is_active = 1 AND h.estado = 'Finalizada' AND ${r.sql}`,
      r.params,
    );
    const km = Number(filas[0]?.km ?? 0);
    const retiros = Number(filas[0]?.retiros ?? 0);
    return { km: redondear(km, 1), retiros, valor: retiros > 0 ? redondear(km / retiros, 1) : null };
  }

  private async retiroDomicilio(f: Filtros) {
    const r = this.rango('d.created_at', f);
    const dn = this.donante('d.donante_id', f);
    const filas = await this.ds.query(
      `SELECT COALESCE(SUM(d.necesita_retiro = 1), 0) conRetiro, COUNT(*) total FROM donacion d
       JOIN estado_donacion e ON e.id = d.estado_donacion_id
       WHERE d.is_active = 1 AND e.descripcion NOT REGEXP 'cancel' AND ${r.sql}${dn.sql}`,
      [...r.params, ...dn.params],
    );
    return { conRetiro: Number(filas[0]?.conRetiro ?? 0), total: Number(filas[0]?.total ?? 0) };
  }

  /**
   * Tiempo de ciclo (registro de la donación hasta el certificado) y su desglose por etapa y mes. Etapas: registro hasta el
   * retiro (o el turno, si se entrega en sucursal), retiro hasta la clasificación, clasificación hasta el pallet (con los
   * procesos de destrucción cerrados) y pallet hasta el certificado. No hay fechas de cada cambio de estado, así que se usan
   * las fechas de los registros (alta de la donación, retiro, última clasificación, alta del pallet y emisión del certificado).
   */
  private async ciclos(f: Filtros) {
    const r = this.rango('c.fecha_emision', f);
    const d = this.donante('d.donante_id', f);
    const filas: { registro: Date; retiro: Date | null; clasificacion: Date | null; pallet: Date | null; certificado: Date }[] = await this.ds.query(
      `SELECT d.created_at registro,
              MIN(COALESCE(r.fecha_retiro, t.fecha_hora)) retiro,
              (SELECT MAX(m.updated_at) FROM material m JOIN lote l2 ON l2.id = m.lote_id WHERE l2.donacion_id = d.id AND m.is_active = 1) clasificacion,
              (SELECT MIN(p.created_at) FROM pallet p JOIN lote l3 ON l3.id = p.lote_id WHERE l3.donacion_id = d.id AND p.is_active = 1) pallet,
              MIN(c.fecha_emision) certificado
       FROM donacion d
       JOIN lote l ON l.donacion_id = d.id AND l.is_active = 1
       JOIN certificado_disposicion c ON c.lote_id = l.id AND c.is_active = 1
       LEFT JOIN retiro r ON r.donacion_id = d.id AND r.is_active = 1
       LEFT JOIN turno t ON t.donacion_id = d.id AND t.is_active = 1
       WHERE d.is_active = 1 AND ${r.sql}${d.sql}
       GROUP BY d.id`,
      [...r.params, ...d.params],
    );

    const dias = (desde: Date | null, hasta: Date | null) =>
      desde && hasta ? Math.max(0, (new Date(hasta).getTime() - new Date(desde).getTime()) / DIA_MS) : null;
    const etapas = ['espera', 'clasificacion', 'destruccionPallet', 'certificacion'] as const;
    type Etapa = (typeof etapas)[number];
    const acumulado = new Map<string, { donaciones: number; suma: Record<Etapa, number>; cuenta: Record<Etapa, number> }>();
    const total = { suma: { espera: 0, clasificacion: 0, destruccionPallet: 0, certificacion: 0 }, cuenta: { espera: 0, clasificacion: 0, destruccionPallet: 0, certificacion: 0 } };
    const ciclo: number[] = [];

    for (const x of filas) {
      const c = dias(x.registro, x.certificado);
      if (c !== null) ciclo.push(c);
      const valores: Record<Etapa, number | null> = {
        espera: dias(x.registro, x.retiro),
        clasificacion: dias(x.retiro, x.clasificacion),
        destruccionPallet: dias(x.clasificacion, x.pallet),
        certificacion: dias(x.pallet, x.certificado),
      };
      const mes = iso(new Date(x.certificado)).slice(0, 7);
      const a = acumulado.get(mes) ?? { donaciones: 0, suma: { espera: 0, clasificacion: 0, destruccionPallet: 0, certificacion: 0 }, cuenta: { espera: 0, clasificacion: 0, destruccionPallet: 0, certificacion: 0 } };
      a.donaciones += 1;
      for (const e of etapas) {
        const v = valores[e];
        if (v === null) continue;
        a.suma[e] += v; a.cuenta[e] += 1;
        total.suma[e] += v; total.cuenta[e] += 1;
      }
      acumulado.set(mes, a);
    }

    const promedio = (suma: number, cuenta: number) => (cuenta > 0 ? redondear(suma / cuenta, 1) : 0);
    const meses = [...acumulado.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([mes, a]) => {
        const e = Object.fromEntries(etapas.map((k) => [k, promedio(a.suma[k], a.cuenta[k])])) as Record<Etapa, number>;
        return { mes, donaciones: a.donaciones, ...e, total: redondear(etapas.reduce((s, k) => s + e[k], 0), 1) };
      });
    const promedioEtapas = Object.fromEntries(etapas.map((k) => [k, promedio(total.suma[k], total.cuenta[k])])) as Record<Etapa, number>;

    return {
      indicador: ciclo.length
        ? { promedio: redondear(ciclo.reduce((s, v) => s + v, 0) / ciclo.length, 1), min: redondear(Math.min(...ciclo), 1), max: redondear(Math.max(...ciclo), 1), donaciones: ciclo.length }
        : null,
      porEtapa: { meses, promedio: promedioEtapas, donaciones: ciclo.length },
    };
  }

  // ── Gráficos ──────────────────────────────────────────────────────────────
  private async destinoPorTipo(f: Filtros) {
    const r = this.rango('m.created_at', f);
    const d = this.donante('d.donante_id', f);
    const filas: { tipo: string; condicion: string; n: string }[] = await this.ds.query(
      `SELECT tm.nombre tipo, c.condicion, COUNT(*) n FROM material m
       JOIN tipo_material tm ON tm.id = m.tipo_material_id
       JOIN condicion_material c ON c.id = m.condicion_material_id
       LEFT JOIN lote l ON l.id = m.lote_id LEFT JOIN donacion d ON d.id = l.donacion_id
       WHERE m.is_active = 1 AND ${r.sql}${d.sql} GROUP BY tm.nombre, c.condicion`,
      [...r.params, ...d.params],
    );
    const porTipo = new Map<string, { tipo: string; reutilizable: number; reciclable: number; desecho: number }>();
    for (const x of filas) {
      const fila = porTipo.get(x.tipo) ?? { tipo: x.tipo, reutilizable: 0, reciclable: 0, desecho: 0 };
      const cant = Number(x.n);
      if (REUTILIZABLE.test(x.condicion)) fila.reutilizable += cant;
      else if (RECICLABLE.test(x.condicion)) fila.reciclable += cant;
      else if (DESECHO.test(x.condicion)) fila.desecho += cant;
      porTipo.set(x.tipo, fila);
    }
    return [...porTipo.values()]
      .map((x) => ({ ...x, total: x.reutilizable + x.reciclable + x.desecho }))
      .filter((x) => x.total > 0)
      .sort((a, b) => b.reutilizable / b.total - a.reutilizable / a.total || b.total - a.total);
  }

  private async demandaTurnos(f: Filtros) {
    const r = this.rango('t.fecha_hora', f);
    const d = this.donante('t.donante_id', f);
    const filas: { dow: number; hora: number; n: string }[] = await this.ds.query(
      `SELECT DAYOFWEEK(t.fecha_hora) dow, HOUR(t.fecha_hora) hora, COUNT(*) n FROM turno t
       JOIN estado_turno e ON e.id = t.estado_turno_id
       WHERE t.is_active = 1 AND e.descripcion NOT REGEXP 'cancel' AND ${r.sql}${d.sql}
       GROUP BY DAYOFWEEK(t.fecha_hora), HOUR(t.fecha_hora)`,
      [...r.params, ...d.params],
    );
    // 1 = lunes ... 5 = viernes (MySQL: 1 domingo ... 7 sábado)
    return filas.map((x) => ({ dia: ((Number(x.dow) + 5) % 7) + 1, hora: Number(x.hora), cantidad: Number(x.n) }));
  }

  private async mapaDonantes(f: Filtros) {
    const r = this.rango('d.created_at', f);
    const dn = this.donante('d.donante_id', f);
    const base: { id: number; nombre: string; tipo: string | null; donaciones: string; kg: string }[] = await this.ds.query(
      `SELECT dn.id, dn.nombre, td.descripcion tipo, COUNT(DISTINCT d.id) donaciones, COALESCE(SUM(l.peso_bruto_kg), 0) kg
       FROM donante dn
       JOIN donacion d ON d.donante_id = dn.id AND d.is_active = 1
       LEFT JOIN lote l ON l.donacion_id = d.id AND l.is_active = 1
       LEFT JOIN tipo_donante td ON td.id = dn.tipo_donante_id
       WHERE ${r.sql}${dn.sql} GROUP BY dn.id, dn.nombre, td.descripcion`,
      [...r.params, ...dn.params],
    );
    const reut: { donante_id: number; reut: string; clasificados: string }[] = await this.ds.query(
      `SELECT d.donante_id, COALESCE(SUM(c.condicion REGEXP 'reutiliz'), 0) reut, COUNT(*) clasificados FROM material m
       JOIN condicion_material c ON c.id = m.condicion_material_id
       JOIN lote l ON l.id = m.lote_id JOIN donacion d ON d.id = l.donacion_id
       WHERE m.is_active = 1 AND c.condicion NOT REGEXP 'definir|pendiente' AND ${r.sql}${dn.sql}
       GROUP BY d.donante_id`,
      [...r.params, ...dn.params],
    );
    const porDonante = new Map(reut.map((x) => [Number(x.donante_id), x]));
    return base.map((x) => {
      const m = porDonante.get(Number(x.id));
      return {
        id: Number(x.id), nombre: x.nombre, tipo: x.tipo ?? 'Sin tipo', donaciones: Number(x.donaciones), kg: redondear(Number(x.kg), 1),
        pctReutilizable: m ? pct(Number(m.reut), Number(m.clasificados)) : null,
      };
    });
  }

  private async kgPorMesYTipo(f: Filtros) {
    const r = this.rango('l.created_at', f);
    const dn = this.donante('d.donante_id', f);
    const filas: { mes: string; tipo: string | null; kg: string }[] = await this.ds.query(
      `SELECT DATE_FORMAT(l.created_at, '%Y-%m') mes, td.descripcion tipo, COALESCE(SUM(l.peso_bruto_kg), 0) kg FROM lote l
       JOIN donacion d ON d.id = l.donacion_id JOIN donante dn ON dn.id = d.donante_id
       LEFT JOIN tipo_donante td ON td.id = dn.tipo_donante_id
       WHERE l.is_active = 1 AND l.peso_bruto_kg IS NOT NULL AND ${r.sql}${dn.sql}
       GROUP BY DATE_FORMAT(l.created_at, '%Y-%m'), td.descripcion ORDER BY mes`,
      [...r.params, ...dn.params],
    );
    return filas.map((x) => ({ mes: x.mes, tipo: x.tipo ?? 'Sin tipo', kg: redondear(Number(x.kg), 1) }));
  }

  private async destruccionPorMetodoYMedio(f: Filtros) {
    const r = this.rango('p.created_at', f);
    const d = this.donante('d.donante_id', f);
    const filas: { metodo: string; medio: string; n: string }[] = await this.ds.query(
      `SELECT COALESCE(md.nombre, 'Sin método') metodo, COALESCE(tp.nombre, 'Sin tipo') medio, COUNT(*) n
       FROM proceso_destruccion p
       JOIN medio_almacenamiento ma ON ma.id = p.medio_almacenamiento_id
       LEFT JOIN tipo tp ON tp.id = ma.tipo_id
       LEFT JOIN metodo_destruccion md ON md.id = p.metodo_destruccion_id
       LEFT JOIN material m ON m.id = ma.material_id LEFT JOIN lote l ON l.id = m.lote_id LEFT JOIN donacion d ON d.id = l.donacion_id
       WHERE p.is_active = 1 AND ${r.sql}${d.sql}
       GROUP BY md.nombre, tp.nombre`,
      [...r.params, ...d.params],
    );
    return filas.map((x) => ({ metodo: x.metodo, medio: x.medio, cantidad: Number(x.n) }));
  }

  private async eficienciaRutas(f: Filtros) {
    const r = this.rango('h.fecha', f);
    const filas: { id: number; fecha: Date | string; paradas: number; km: string; transportista: string }[] = await this.ds.query(
      `SELECT h.id, h.fecha, h.cantidad_pedidos paradas, h.km_estimados km, CONCAT(e.nombre, ' ', e.apellido) transportista
       FROM hoja_ruta h
       JOIN empleado_transportista et ON et.id = h.empleado_transportista_id
       JOIN empleado e ON e.id = et.empleado_id
       WHERE h.is_active = 1 AND h.estado = 'Finalizada' AND h.km_estimados IS NOT NULL AND ${r.sql}`,
      r.params,
    );
    return filas.map((x) => ({ id: Number(x.id), fecha: typeof x.fecha === 'string' ? x.fecha.slice(0, 10) : iso(new Date(x.fecha)), paradas: Number(x.paradas), km: redondear(Number(x.km), 1), transportista: x.transportista }));
  }
}
