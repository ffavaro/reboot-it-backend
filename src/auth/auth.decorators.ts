import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const ROLES_KEY = 'roles';

/**
 * Roles del sistema, en minúsculas y sin tildes (tabla rol: 1 Admin, 2 Administrativo, 3 Reciclado,
 * 4 Técnico, 5 Transportista, 6 Dirección, 7 Donante).
 * El menú del frontend solo distingue tres grupos, y el backend replica ese criterio:
 *  - DONANTE y TRANSPORTISTA: ven únicamente sus pantallas
 *  - STAFF: cualquier otro rol (Admin, Administrativo, Reciclado, Técnico, Dirección...), ve todo
 *  - ADMIN: solo el rol Admin (por ejemplo, la auditoría)
 */
export const ROL = {
  ADMIN: 'admin',
  DONANTE: 'donante',
  TRANSPORTISTA: 'transportista',
  STAFF: 'staff',
} as const;
export type RolPermitido = (typeof ROL)[keyof typeof ROL];

// Id del rol "Donante" en la tabla rol (se asigna a quien se registra desde la pantalla pública)
export const ROL_ID_DONANTE = 7;

/** Ruta abierta: no exige token (login, registro y lo que el registro necesita antes de iniciar sesión). */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

/** Restringe el endpoint a los roles indicados. Puesto en un método reemplaza al @Roles de la clase. */
export const Roles = (...roles: RolPermitido[]) => SetMetadata(ROLES_KEY, roles);

/** Cualquier usuario autenticado, de cualquier rol (token válido, sin restricción de rol). */
export const Authenticated = () => SetMetadata(ROLES_KEY, []);
