import type { Request } from 'express';
import type { Accion, Alcance } from '../permisos/permisos.constants';

// Contenido del JWT (lo arma AuthService al iniciar sesión: el usuario sin su contraseña)
export interface AuthUser {
  id: number;
  nombre: string;
  email: string;
  rolId: number;
  empleadoId?: number | null;
  rol?: { id: number; nombre: string };
  isActive?: boolean;
  iat?: number;
  exp?: number;
}

// Lo completa PermisosGuard cuando la ruta exige una pantalla: el alcance con el que el rol puede hacer la acción
export interface PermisoConcedido {
  pantallas: string[];
  accion: Accion;
  alcance: Alcance;
}

export type RequestConUsuario = Request & { user?: AuthUser; permiso?: PermisoConcedido };
