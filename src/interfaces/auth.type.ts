import { Accion, Alcance } from '@app/permisos/permisos.constants';
import type { Request } from 'express';

export interface UsuarioToken { 
    id:number,
    email: string,
    nombre: string,
    rolId?: number,
    rol?: { id:number, nombre: string} | null,
    empleadoId: number | null,
    iat?:number,
    exp?:number
}

export interface Acceso {
    pantallas: string[];
    accion: Accion;
    alcance: Alcance;
}

export type RequestConUsuario = Request & { user?: UsuarioToken; acceso: Acceso };
