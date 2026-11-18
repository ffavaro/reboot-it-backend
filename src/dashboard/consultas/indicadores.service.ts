import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import {
  Condicion, Fila, Filtros, destinoDe, entreFecha, filtrar, porcentaje, redondear,
} from '@app/interfaces/dashboard.type';

@Injectable()
export class IndicadoresService {
  constructor(@InjectDataSource() private readonly ds: DataSource) {}

  private consultar = (sql: string, w?: Condicion) => this.ds.query<Fila[]>(sql, w?.params ?? []);

  private contar = async (sql: string) => Number((await this.consultar(sql))[0]?.n ?? 0);

  trabajoPendiente = async (completo: boolean) => {
    const [lotesPorClasificar, procesosAbiertos] = await Promise.all([
      this.contar(`
        SELECT COUNT(DISTINCT l.id) n
        FROM lote l
        JOIN material m ON m.lote_id = l.id AND m.is_active = 1
        LEFT JOIN condicion_material c ON c.id = m.condicion_material_id
        WHERE l.is_active = 1
          AND (m.condicion_material_id IS NULL OR c.condicion REGEXP 'definir|pendiente')`),
      this.contar(`
        SELECT COUNT(*) n
        FROM proceso_destruccion p
        JOIN estado_proceso_destruccion e ON e.id = p.estado_id
        WHERE p.is_active = 1 AND e.nombre NOT REGEXP 'finaliz|complet|cancel|anulad'`),
    ]);

    if (!completo) {
      return { turnosSinAsignarManana: null, lotesPorClasificar, procesosAbiertos, donacionesParaCertificar: null };
    }

    const [turnosSinAsignarManana, donacionesParaCertificar] = await Promise.all([
      this.contar(`
        SELECT COUNT(*) n
        FROM turno t
        JOIN estado_turno e ON e.id = t.estado_turno_id
        WHERE t.is_active = 1
          AND DATE(t.fecha_hora) = DATE_ADD(CURDATE(), INTERVAL 1 DAY)
          AND t.empleado_id IS NULL AND t.empleado_transportista_id IS NULL
          AND e.descripcion NOT REGEXP 'cancel|finaliz|clasific'`),
      this.contar(`
        SELECT COUNT(*) n
        FROM donacion d
        JOIN estado_donacion e ON e.id = d.estado_donacion_id
        WHERE d.is_active = 1 AND e.descripcion REGEXP 'certificado'`),
    ]);

    return { turnosSinAsignarManana, lotesPorClasificar, procesosAbiertos, donacionesParaCertificar };
  };

  reutilizacion = async (f: Filtros) => {
    const w = filtrar('m.created_at', 'd.donante_id', f);
    const filas = await this.consultar(
      `SELECT c.condicion, COUNT(*) n
       FROM material m
       JOIN condicion_material c ON c.id = m.condicion_material_id
       LEFT JOIN lote l ON l.id = m.lote_id
       LEFT JOIN donacion d ON d.id = l.donacion_id
       WHERE m.is_active = 1 AND ${w.sql}
       GROUP BY c.condicion`,
      w,
    );
    const cantidades = { reutilizable: 0, reciclable: 0, desecho: 0 };
    for (const fila of filas) {
      const destino = destinoDe(String(fila.condicion));
      if (destino) cantidades[destino] += Number(fila.n);
    }
    const total = cantidades.reutilizable + cantidades.reciclable + cantidades.desecho;
    return {
      ...cantidades,
      total,
      pctReutilizable: porcentaje(cantidades.reutilizable, total),
      pctDesecho: porcentaje(cantidades.desecho, total),
    };
  };

  kgProcesados = async (f: Filtros) => {
    const w = filtrar('l.created_at', 'd.donante_id', f);
    const [fila] = await this.consultar(
      `SELECT COALESCE(SUM(l.peso_bruto_kg), 0) kg
       FROM lote l
       LEFT JOIN donacion d ON d.id = l.donacion_id
       WHERE l.is_active = 1 AND l.peso_bruto_kg IS NOT NULL AND ${w.sql}`,
      w,
    );
    return redondear(Number(fila?.kg ?? 0));
  };

  mediosDestruidos = async (f: Filtros) => {
    const w = filtrar('p.created_at', 'd.donante_id', f);
    const [fila] = await this.consultar(
      `SELECT COALESCE(SUM(e.nombre REGEXP 'finaliz|complet'), 0) finalizados, COUNT(*) total
       FROM proceso_destruccion p
       JOIN estado_proceso_destruccion e ON e.id = p.estado_id
       JOIN medio_almacenamiento ma ON ma.id = p.medio_almacenamiento_id
       LEFT JOIN material m ON m.id = ma.material_id
       LEFT JOIN lote l ON l.id = m.lote_id
       LEFT JOIN donacion d ON d.id = l.donacion_id
       WHERE p.is_active = 1 AND ${w.sql}`,
      w,
    );
    return { finalizados: Number(fila?.finalizados ?? 0), total: Number(fila?.total ?? 0) };
  };

  donantesRecurrentes = async (f: Filtros) => {
    const w = filtrar('d.created_at', 'd.donante_id', f);
    const filas = await this.consultar(
      `SELECT COUNT(*) n
       FROM donacion d
       WHERE d.is_active = 1 AND ${w.sql}
       GROUP BY d.donante_id`,
      w,
    );
    return { recurrentes: filas.filter((r) => Number(r.n) > 1).length, total: filas.length };
  };

  kmPorRetiro = async (f: Filtros) => {
    const w = entreFecha('h.fecha', f);
    const [fila] = await this.consultar(
      `SELECT COALESCE(SUM(h.km_estimados), 0) km, COALESCE(SUM(h.cantidad_pedidos), 0) retiros
       FROM hoja_ruta h
       WHERE h.is_active = 1 AND h.estado = 'Finalizada' AND ${w.sql}`,
      w,
    );
    const km = Number(fila?.km ?? 0);
    const retiros = Number(fila?.retiros ?? 0);
    return { km: redondear(km), retiros, valor: retiros > 0 ? redondear(km / retiros) : null };
  };

  retiroDomicilio = async (f: Filtros) => {
    const w = filtrar('d.created_at', 'd.donante_id', f);
    const [fila] = await this.consultar(
      `SELECT COALESCE(SUM(d.necesita_retiro = 1), 0) conRetiro, COUNT(*) total
       FROM donacion d
       JOIN estado_donacion e ON e.id = d.estado_donacion_id
       WHERE d.is_active = 1 AND e.descripcion NOT REGEXP 'cancel' AND ${w.sql}`,
      w,
    );
    return { conRetiro: Number(fila?.conRetiro ?? 0), total: Number(fila?.total ?? 0) };
  };
}
