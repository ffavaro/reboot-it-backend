import { SetMetadata } from '@nestjs/common';
import type { Accion } from '../permisos/permisos.constants';

export const IS_PUBLIC_KEY = 'isPublic';
export const PANTALLAS_KEY = 'pantallas';
export const ACCION_KEY = 'accionPermiso';

/**
 * Ids de la tabla rol que el código necesita conocer (ver db_reboot_it/roles_permisos.sql):
 * 1 Admin (SysAdmin), 2 Administrativo, 3 Técnico, 4 Transportista, 5 Donante.
 * Los permisos de cada rol no están en el código: salen de las tablas pantalla y rol_permiso.
 */
export const ROL_ID_DONANTE = 5;

/** Ruta abierta: no exige token (login, registro y lo que el registro necesita antes de iniciar sesión). */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

/**
 * Exige permiso sobre alguna de las pantallas indicadas (clave de la tabla pantalla). La acción sale del método
 * HTTP (GET ver, POST crear, PUT/PATCH editar, DELETE baja) y se puede cambiar con @Accion.
 * Puesto en un método reemplaza al de la clase. Con varias pantallas alcanza con tener permiso en una
 * (por ejemplo, un listado que usan varias pantallas como combo).
 */
export const Pantalla = (...claves: string[]) => SetMetadata(PANTALLAS_KEY, claves);

/** Acción de la matriz que exige la ruta cuando no coincide con su método HTTP (ej. un POST que edita). */
export const Accion_ = (accion: Accion) => SetMetadata(ACCION_KEY, accion);
export { Accion_ as Accion };

/** Cualquier usuario autenticado, de cualquier rol (token válido, sin permiso de pantalla). */
export const Authenticated = () => SetMetadata(PANTALLAS_KEY, []);
