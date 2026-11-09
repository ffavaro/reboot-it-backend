import type { Alcance } from './permisos.constants';

export type Recurso =
  | 'donantes'
  | 'donaciones'
  | 'turnos'
  | 'retiros'
  | 'lotes'
  | 'certificados'
  | 'constancias'
  | 'fotos'
  | 'vehiculos'
  | 'historialKm'
  | 'transportistas'
  | 'empleados'
  | 'usuarios';

type Restringido = Exclude<Alcance, 'TODOS'>;
type Consultas = Partial<Record<Restringido, string>>;

const DONANTE_DEL_USUARIO = `SELECT d.id FROM donante d WHERE d.usuario_id = :alcanceUsuarioId AND d.is_active = 1`;

const FICHA_DEL_EMPLEADO = `SELECT et.id FROM empleado_transportista et WHERE et.empleado_id = :alcanceEmpleadoId AND et.is_active = 1`;

const TURNOS_EN_PLANTA = `SELECT t.id FROM turno t JOIN estado_turno e ON e.id = t.estado_turno_id
  WHERE t.is_active = 1 AND e.descripcion IN (:...alcanceEstadosPlanta)`;

const donaciones: Consultas = {
  PROPIOS: `SELECT id FROM donacion WHERE donante_id IN (${DONANTE_DEL_USUARIO})`,
  ASIGNADOS: `SELECT donacion_id FROM turno WHERE empleado_transportista_id IN (${FICHA_DEL_EMPLEADO})
    UNION SELECT donacion_id FROM retiro WHERE empleado_transportista_id IN (${FICHA_DEL_EMPLEADO})`,
  EN_PLANTA: `SELECT donacion_id FROM turno WHERE id IN (${TURNOS_EN_PLANTA})`,
};

const turnos: Consultas = {
  PROPIOS: `SELECT id FROM turno WHERE donante_id IN (${DONANTE_DEL_USUARIO})`,
  ASIGNADOS: `SELECT id FROM turno WHERE empleado_transportista_id IN (${FICHA_DEL_EMPLEADO})`,
  EN_PLANTA: TURNOS_EN_PLANTA,
};

const retiros: Consultas = {
  PROPIOS: `SELECT id FROM retiro WHERE donacion_id IN (${donaciones.PROPIOS})`,
  ASIGNADOS: `SELECT id FROM retiro WHERE empleado_transportista_id IN (${FICHA_DEL_EMPLEADO})`,
  EN_PLANTA: `SELECT id FROM retiro WHERE donacion_id IN (${donaciones.EN_PLANTA})`,
};

function derivada(plantilla: (origen: string) => string, origen: Consultas): Consultas {
  return Object.fromEntries(Object.entries(origen).map(([alcance, sql]) => [alcance, plantilla(sql)]));
}

const lotes = derivada((sql) => `SELECT id FROM lote WHERE donacion_id IN (${sql})`, donaciones);

const vehiculos: Consultas = {
  ASIGNADOS: `SELECT vehiculo_id FROM empleado_transportista WHERE id IN (${FICHA_DEL_EMPLEADO})`,
  PROPIOS: `SELECT vehiculo_id FROM empleado_transportista WHERE id IN (${FICHA_DEL_EMPLEADO})`,
};

const DEL_PROPIO_EMPLEADO = `SELECT e.id FROM empleado e WHERE e.id = :alcanceEmpleadoId`;

export const CONSULTAS_POR_RECURSO: Record<Recurso, Consultas> = {
  donaciones,
  turnos,
  retiros,
  lotes,
  vehiculos,
  donantes: {
    PROPIOS: DONANTE_DEL_USUARIO,
    ASIGNADOS: `SELECT donante_id FROM donacion WHERE id IN (${donaciones.ASIGNADOS})`,
    EN_PLANTA: `SELECT donante_id FROM donacion WHERE id IN (${donaciones.EN_PLANTA})`,
  },
  certificados: derivada((sql) => `SELECT id FROM certificado_disposicion WHERE lote_id IN (${sql})`, lotes),
  constancias: derivada((sql) => `SELECT id FROM constancia_retiro WHERE retiro_id IN (${sql})`, retiros),
  fotos: Object.fromEntries(
    (['PROPIOS', 'ASIGNADOS', 'EN_PLANTA'] as const).map((alcance) => [
      alcance,
      `SELECT id FROM registro_fotografico WHERE turno_id IN (${turnos[alcance]}) OR lote_id IN (${lotes[alcance]})`,
    ]),
  ),
  historialKm: derivada((sql) => `SELECT id FROM historial_km_vehiculo WHERE vehiculo_id IN (${sql})`, vehiculos),
  transportistas: {
    ASIGNADOS: FICHA_DEL_EMPLEADO,
    PROPIOS: `${FICHA_DEL_EMPLEADO}
      UNION SELECT empleado_transportista_id FROM turno WHERE id IN (${turnos.PROPIOS})
      UNION SELECT empleado_transportista_id FROM retiro WHERE id IN (${retiros.PROPIOS})`,
  },
  empleados: { PROPIOS: DEL_PROPIO_EMPLEADO, ASIGNADOS: DEL_PROPIO_EMPLEADO },
  usuarios: { PROPIOS: `SELECT u.id FROM usuario u WHERE u.id = :alcanceUsuarioId` },
};
