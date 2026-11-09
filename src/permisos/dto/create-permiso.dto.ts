import type { Alcance } from "../permisos.constants";

export class PermisoPantallaDto {
    pantallaId: number

    ver: boolean;

    crear: boolean;

    editar: boolean;
    
    baja: boolean

    alcance: Alcance
}

export class GuardarPermisosDto {
    permisos: PermisoPantallaDto[]
}