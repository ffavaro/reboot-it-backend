import { SetMetadata } from '@nestjs/common';

export const NO_AUDITAR = 'auditoria:omitir';

export const NoAuditar = () => SetMetadata(NO_AUDITAR, true);

const ENTIDADES: Record<string, string> = {
  auth: 'sesión',
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
  pantalla: 'pantalla',
  'proceso-destruccion': 'proceso de destrucción',
  rack: 'rack',
  'registro-fotografico': 'registro fotográfico',
  retiro: 'retiro',
  'rol-permiso': 'permiso de rol',
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

const ESPECIALES: Record<string, string> = {
  'POST auth/register': 'Registro de usuario',
  'POST auth/forgot-password': 'Solicitó código de recuperación',
  'POST auth/reset-password': 'Restableció contraseña',
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

const VERBOS: Record<string, string> = {
  GET: 'Consultó',
  POST: 'Creó',
  PUT: 'Modificó',
  PATCH: 'Modificó',
  DELETE: 'Desactivó',
};

const BORRADO_FISICO = new Set(['historial-km-vehiculo']);

export function describirAccion(
  metodo: string,
  patron?: string,
): { accion: string; entidad: string | null } {
  const tramos = (patron ?? '').split('/').filter(Boolean);
  const [entidad] = tramos;
  if (!entidad) {
    return {
      accion: `${VERBOS[metodo] ?? metodo} ${patron || 'ruta desconocida'}`,
      entidad: null,
    };
  }

  const subruta = tramos.slice(1).filter((t) => !t.startsWith(':'));
  const especial = ESPECIALES[`${metodo} ${[entidad, ...subruta].join('/')}`];
  if (especial) return { accion: especial, entidad };

  const nombre = ENTIDADES[entidad] ?? entidad;
  if (subruta[0] === 'reporte') {
    return { accion: `Consultó reporte de ${nombre}`, entidad };
  }

  const verbo =
    metodo === 'DELETE' && BORRADO_FISICO.has(entidad)
      ? 'Eliminó'
      : (VERBOS[metodo] ?? metodo);
  return { accion: `${verbo} ${nombre}`, entidad };
}
