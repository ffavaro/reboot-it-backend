import type { Request } from 'express';

// Contenido del JWT (lo arma AuthService al iniciar sesión: el usuario sin su contraseña)
export interface AuthUser {
  id: number;
  nombre: string;
  email: string;
  rolId: number;
  rol?: { id: number; nombre: string };
  isActive?: boolean;
  iat?: number;
  exp?: number;
}

export type RequestConUsuario = Request & { user?: AuthUser };
