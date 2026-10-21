/**
 * Nombres de los registros de catálogo que el código busca por texto.
 * Tienen que coincidir EXACTAMENTE con lo que hay cargado en la base (tablas estado_turno,
 * estado_donacion y condicion_material): si se renombra un registro en la base, se cambia acá.
 */

// estado_turno.descripcion
export const ESTADO_TURNO = {
  PENDIENTE: 'Pendiente',
  RETIRO_CONFIRMADO: 'Retiro confirmado',
  FINALIZADO: 'Finalizado',
  CANCELADO: 'Cancelado',
  REPROGRAMADO: 'Reprogramado',
  SIN_ASIGNAR: 'Sin asignar',
  ASIGNADO: 'Asignado',
  EN_CLASIFICACION: 'En Clasificacion',
} as const;

// estado_donacion.descripcion
export const ESTADO_DONACION = {
  PENDIENTE: 'Pendiente',
  EN_PROCESO: 'En proceso',
  FINALIZADA: 'Finalizada',
  CANCELADA: 'Cancelada',
  PENDIENTE_CERTIFICADO: 'Pendiente de emision certificado',
} as const;

// condicion_material.condicion
export const CONDICION_MATERIAL = {
  REUTILIZABLE: 'Reutilizable',
  RECICLABLE: 'Reciclable',
  DESECHO: 'Desecho',
  // Condición de un material recién cargado, todavía sin clasificar
  A_DEFINIR: 'A definir',
} as const;

// estado_proceso_destruccion.nombre: un proceso está cerrado cuando su estado coincide con esto (Finalizado, Completado,
// Cancelado, Anulado). Se usa para el doble control de la destrucción y para emitir certificados.
export const PROCESO_DESTRUCCION_CERRADO = /finaliz|complet|cancel|anulad/i;
