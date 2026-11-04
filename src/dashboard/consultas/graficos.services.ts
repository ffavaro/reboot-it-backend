import { Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { Filtros, entreFecha, filtrarDonantes, destinoDe, FechasDonacion, resumirCiclos, porcentaje, redondear, SIN_TIPO } from "../../interfaces/dashboard.type";
import { aFechaLocal } from "@app/utils/helpers";

@Injectable()
export class GraficosService {
    constructor(@InjectDataSource() private readonly ds: DataSource) { }

    ciclos = async (filtros: Filtros) => {
        const fechas = entreFecha('c.fecha_emision', filtros);
        const donantes = filtrarDonantes('d.donante_id', filtros);
        const filas = await this.ds.query<FechasDonacion[]>(
            `SELECT d.created_at registro,
              MIN(COALESCE(r.fecha_retiro, t.fecha_hora)) retiro,
              (SELECT MAX(m.updated_at) FROM material m
                 JOIN lote l2 ON l2.id = m.lote_id
                WHERE l2.donacion_id = d.id AND m.is_active = 1) clasificacion,
              (SELECT MIN(p.created_at) FROM pallet p
                 JOIN lote l3 ON l3.id = p.lote_id
                WHERE l3.donacion_id = d.id AND p.is_active = 1) pallet,
              MIN(c.fecha_emision) certificado
       FROM donacion d
       JOIN lote l ON l.donacion_id = d.id AND l.is_active = 1
       JOIN certificado_disposicion c ON c.lote_id = l.id AND c.is_active = 1
       LEFT JOIN retiro r ON r.donacion_id = d.id AND r.is_active = 1
       LEFT JOIN turno t ON t.donacion_id = d.id AND t.is_active = 1
       WHERE d.is_active = 1 AND ${fechas.sql}${donantes.sql}
       GROUP BY d.id`,
            [...fechas.params, ...donantes.params],
        );
        return resumirCiclos(filas);
    }

    destinoPorTipo = async (filtros: Filtros) => {
        const fechas = entreFecha('m.created_at', filtros);
        const donantes = filtrarDonantes('d.donante_id', filtros);
        const filas = await this.ds.query<
            { tipo: string; condicion: string; n: string }[]
        >(
            `SELECT tm.nombre tipo, c.condicion, COUNT(*) n
       FROM material m
       JOIN tipo_material tm ON tm.id = m.tipo_material_id
       JOIN condicion_material c ON c.id = m.condicion_material_id
       LEFT JOIN lote l ON l.id = m.lote_id
       LEFT JOIN donacion d ON d.id = l.donacion_id
       WHERE m.is_active = 1 AND ${fechas.sql}${donantes.sql}
       GROUP BY tm.nombre, c.condicion`,
            [...fechas.params, ...donantes.params],
        );

        const porTipo = new Map<
            string,
            {
                tipo: string;
                reutilizable: number;
                reciclable: number;
                desecho: number;
            }
        >();
        for (const fila of filas) {
            const actual = porTipo.get(fila.tipo) ?? {
                tipo: fila.tipo,
                reutilizable: 0,
                reciclable: 0,
                desecho: 0,
            };
            const destino = destinoDe(fila.condicion);
            if (destino) actual[destino] += Number(fila.n);
            porTipo.set(fila.tipo, actual);
        }

        return [...porTipo.values()]
            .map((t) => ({ ...t, total: t.reutilizable + t.reciclable + t.desecho }))
            .filter((t) => t.total > 0)
            .sort(
                (a, b) =>
                    b.reutilizable / b.total - a.reutilizable / a.total ||
                    b.total - a.total,
            );
    }

    demandaTurnos = async (filtros: Filtros) => {
        const fechas = entreFecha('t.fecha_hora', filtros);
        const donantes = filtrarDonantes('t.donante_id', filtros);
        const filas = await this.ds.query<
            { dow: number; hora: number; n: string }[]
        >(
            `SELECT DAYOFWEEK(t.fecha_hora) dow, HOUR(t.fecha_hora) hora, COUNT(*) n
       FROM turno t
       JOIN estado_turno e ON e.id = t.estado_turno_id
       WHERE t.is_active = 1 AND e.descripcion NOT REGEXP 'cancel' AND ${fechas.sql}${donantes.sql}
       GROUP BY DAYOFWEEK(t.fecha_hora), HOUR(t.fecha_hora)`,
            [...fechas.params, ...donantes.params],
        );
        return filas.map((f) => ({
            dia: ((Number(f.dow) + 5) % 7) + 1,
            hora: Number(f.hora),
            cantidad: Number(f.n),
        }));
    }

    mapaDonantes = async (filtros: Filtros) => {
        const fechas = entreFecha('d.created_at', filtros);
        const donantes = filtrarDonantes('d.donante_id', filtros);
        const params = [...fechas.params, ...donantes.params];

        const [base, clasificados] = await Promise.all([
            this.ds.query<
                {
                    id: number;
                    nombre: string;
                    tipo: string | null;
                    donaciones: string;
                    kg: string;
                }[]
            >(
                `SELECT dn.id, dn.nombre, td.descripcion tipo,
                COUNT(DISTINCT d.id) donaciones, COALESCE(SUM(l.peso_bruto_kg), 0) kg
         FROM donante dn
         JOIN donacion d ON d.donante_id = dn.id AND d.is_active = 1
         LEFT JOIN lote l ON l.donacion_id = d.id AND l.is_active = 1
         LEFT JOIN tipo_donante td ON td.id = dn.tipo_donante_id
         WHERE ${fechas.sql}${donantes.sql}
         GROUP BY dn.id, dn.nombre, td.descripcion`,
                params,
            ),
            this.ds.query<
                { donante_id: number; reutilizables: string; total: string }[]
            >(
                `SELECT d.donante_id, COALESCE(SUM(c.condicion REGEXP 'reutiliz'), 0) reutilizables, COUNT(*) total
         FROM material m
         JOIN condicion_material c ON c.id = m.condicion_material_id
         JOIN lote l ON l.id = m.lote_id
         JOIN donacion d ON d.id = l.donacion_id
         WHERE m.is_active = 1 AND c.condicion NOT REGEXP 'definir|pendiente' AND ${fechas.sql}${donantes.sql}
         GROUP BY d.donante_id`,
                params,
            ),
        ]);

        const materiales = new Map(
            clasificados.map((c) => [Number(c.donante_id), c]),
        );
        return base.map((d) => {
            const propios = materiales.get(Number(d.id));
            return {
                id: Number(d.id),
                nombre: d.nombre,
                tipo: d.tipo ?? SIN_TIPO,
                donaciones: Number(d.donaciones),
                kg: redondear(Number(d.kg)),
                pctReutilizable: propios
                    ? porcentaje(Number(propios.reutilizables), Number(propios.total))
                    : null,
            };
        });
    }

    kgPorMesYTipo = async (filtros: Filtros) => {
        const fechas = entreFecha('l.created_at', filtros);
        const donantes = filtrarDonantes('d.donante_id', filtros);
        const filas = await this.ds.query<
            { mes: string; tipo: string | null; kg: string }[]
        >(
            `SELECT DATE_FORMAT(l.created_at, '%Y-%m') mes, td.descripcion tipo, COALESCE(SUM(l.peso_bruto_kg), 0) kg
       FROM lote l
       JOIN donacion d ON d.id = l.donacion_id
       JOIN donante dn ON dn.id = d.donante_id
       LEFT JOIN tipo_donante td ON td.id = dn.tipo_donante_id
       WHERE l.is_active = 1 AND l.peso_bruto_kg IS NOT NULL AND ${fechas.sql}${donantes.sql}
       GROUP BY DATE_FORMAT(l.created_at, '%Y-%m'), td.descripcion
       ORDER BY mes`,
            [...fechas.params, ...donantes.params],
        );
        return filas.map((f) => ({
            mes: f.mes,
            tipo: f.tipo ?? SIN_TIPO,
            kg: redondear(Number(f.kg)),
        }));
    }

    destruccionPorMetodoYMedio = async (filtros: Filtros) => {
        const fechas = entreFecha('p.created_at', filtros);
        const donantes = filtrarDonantes('d.donante_id', filtros);
        const filas = await this.ds.query<
            { metodo: string; medio: string; n: string }[]
        >(
            `SELECT COALESCE(md.nombre, 'Sin método') metodo, COALESCE(tp.nombre, 'Sin tipo') medio, COUNT(*) n
       FROM proceso_destruccion p
       JOIN medio_almacenamiento ma ON ma.id = p.medio_almacenamiento_id
       LEFT JOIN tipo tp ON tp.id = ma.tipo_id
       LEFT JOIN metodo_destruccion md ON md.id = p.metodo_destruccion_id
       LEFT JOIN material m ON m.id = ma.material_id
       LEFT JOIN lote l ON l.id = m.lote_id
       LEFT JOIN donacion d ON d.id = l.donacion_id
       WHERE p.is_active = 1 AND ${fechas.sql}${donantes.sql}
       GROUP BY md.nombre, tp.nombre`,
            [...fechas.params, ...donantes.params],
        );
        return filas.map((f) => ({
            metodo: f.metodo,
            medio: f.medio,
            cantidad: Number(f.n),
        }));
    }

    eficienciaRutas = async (filtros: Filtros) => {
        const fechas = entreFecha('h.fecha', filtros);
        const filas = await this.ds.query<
            {
                id: number;
                fecha: Date | string;
                paradas: number;
                km: string;
                transportista: string;
            }[]
        >(
            `SELECT h.id, h.fecha, h.cantidad_pedidos paradas, h.km_estimados km,
              CONCAT(e.nombre, ' ', e.apellido) transportista
       FROM hoja_ruta h
       JOIN empleado_transportista et ON et.id = h.empleado_transportista_id
       JOIN empleado e ON e.id = et.empleado_id
       WHERE h.is_active = 1 AND h.estado = 'Finalizada' AND h.km_estimados IS NOT NULL AND ${fechas.sql}`,
            fechas.params,
        );
        return filas.map((f) => ({
            id: Number(f.id),
            fecha:
                typeof f.fecha === 'string'
                    ? f.fecha.slice(0, 10)
                    : aFechaLocal(new Date(f.fecha)),
            paradas: Number(f.paradas),
            km: redondear(Number(f.km)),
            transportista: f.transportista,
        }));
    }

}