// Acciones de la matriz de permisos (columnas V / C / E / B)
export const ACCIONES = ['ver', 'crear', 'editar', 'baja'] as const;
export type Accion = (typeof ACCIONES)[number];

/**
 * Alcance con el que un rol puede ejecutar una acción sobre una pantalla:
 *  - NINGUNO: sin acceso
 *  - PLENO: acceso completo
 *  - PROPIO: solo sus propios registros
 *  - ASIGNADO: solo los registros que tiene asignados
 *  - LIMITADO: con restricciones de estado o de campos (ver las notas de la pantalla)
 */
export const ALCANCES = ['NINGUNO', 'PLENO', 'PROPIO', 'ASIGNADO', 'LIMITADO'] as const;
export type Alcance = (typeof ALCANCES)[number];

export type PermisosPantalla = Record<Accion, Alcance>;

// Método HTTP -> acción de la matriz (se puede cambiar por ruta con @Accion)
export const ACCION_POR_METODO: Record<string, Accion> = {
  GET: 'ver',
  HEAD: 'ver',
  POST: 'crear',
  PUT: 'editar',
  PATCH: 'editar',
  DELETE: 'baja',
};
