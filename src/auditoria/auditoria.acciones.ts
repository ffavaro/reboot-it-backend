import { SetMetadata } from '@nestjs/common';

export const NO_AUDITAR_KEY = 'noAuditar';

/** Excluye el endpoint de la auditoría automática (login, que se registra aparte, y GET /auditoria). */
export const NoAuditar = () => SetMetadata(NO_AUDITAR_KEY, true);

// primer tramo de la ruta (nombre del controlador) -> cómo se nombra en la acción
const ENTIDADES: Record<string, string> = {
  auth: 'sesión',
  auditoria: 'auditoría',
  'certificado-disposicion': 'certificado de disposición',
  'condicion-material': 'condición de material',
  'constancia-retiro': 'constancia de retiro',
  'donacion-detalle': 'detalle de donación',
  donacion: 'donación',
  donantes: 'donante',
  'empleado-transportista': 'empleado transportista',
  empleados: 'empleado',
  'estado-donacion': 'estado de donación',
  'estado-proceso-destruccion': 'estado de proceso de destrucción',
  'estado-turno': 'estado de turno',
  'gestor-ambiental': 'gestor ambiental',
  'historial-km-vehiculo': 'historial de km',
  'hojas-ruta': 'hoja de ruta',
  lote: 'lote',
  marca: 'marca',
  material: 'material',
  'medio-almacenamiento': 'medio de almacenamiento',
  'metodo-destruccion': 'método de destrucción',
  modelo: 'modelo',
  pallet: 'pallet',
  'proceso-destruccion': 'proceso de destrucción',
  rack: 'rack',
  'registro-fotografico': 'registro fotográfico',
  retiro: 'retiro',
  roles: 'rol',
  'tipo-donante': 'tipo de donante',
  'tipo-material': 'tipo de material',
  'tipo-vehiculo': 'tipo de vehículo',
  tipo: 'tipo',
  'turno-detalle': 'detalle de turno',
  turno: 'turno',
  upload: 'imagen',
  usuarios: 'usuario',
  vehiculos: 'vehículo',
};

// acciones puntuales que no salen del verbo HTTP: "MÉTODO controlador/subruta"
const ACCIONES_ESPECIALES: Record<string, string> = {
  'POST auth/register': 'Registro de usuario',
  'POST upload': 'Subió una imagen',
  'PATCH turno/asignar': 'Asignó turno',
  'PATCH turno/finalizar': 'Finalizó turno',
  'PATCH material/clasificar': 'Clasificó material',
  'POST hojas-ruta/generar': 'Generó hoja de ruta',
  'POST hojas-ruta/turnos/confirmar-retiro': 'Confirmó retiro de turno',
  'GET hojas-ruta/turnos/constancia': 'Consultó constancia de retiro de turno',
  'GET hojas-ruta/dia': 'Consultó hojas de ruta',
  'GET hojas-ruta/historico': 'Consultó histórico de hojas de ruta',
};

const VERBOS: Record<string, string> = { GET: 'Consultó', POST: 'Creó', PUT: 'Modificó', PATCH: 'Modificó', DELETE: 'Desactivó' };

/**
 * A partir del método y del patrón de ruta de Express (ej. "/turno/:id/finalizar") arma una acción
 * legible ("Finalizó turno") y la entidad afectada ("turno").
 */
export function describirAccion(metodo: string, patronRuta: string | undefined): { accion: string; entidad: string | null } {
  const tramos = (patronRuta ?? '').split('/').filter(Boolean);
  const entidad = tramos[0] ?? null;
  if (!entidad) return { accion: `${VERBOS[metodo] ?? metodo} ${patronRuta ?? 'ruta desconocida'}`, entidad };

  const sub = tramos.slice(1).filter((t) => !t.startsWith(':'));
  const especial = ACCIONES_ESPECIALES[`${metodo} ${[entidad, ...sub].join('/')}`];
  if (especial) return { accion: especial, entidad };

  const etiqueta = ENTIDADES[entidad] ?? entidad;
  if (sub[0] === 'reporte') return { accion: `Consultó reporte de ${etiqueta}`, entidad };
  // el historial de km se elimina de verdad (no tiene baja lógica)
  const verbo = metodo === 'DELETE' && entidad === 'historial-km-vehiculo' ? 'Eliminó' : (VERBOS[metodo] ?? metodo);
  return { accion: `${verbo} ${etiqueta}`, entidad };
}
