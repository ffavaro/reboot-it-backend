import { IsBoolean, IsInt } from "class-validator";
import type { Alcance } from "../permisos.constants";
import { Type } from "class-transformer";

export class PermisoPantallaDto {
    @IsInt()
    pantallaId: number

    @IsBoolean()
    ver: boolean;
    
    @IsBoolean()
    crear: boolean;
    
    @IsBoolean()
    editar: boolean;
    
    @IsBoolean()
    baja: boolean

    alcance: Alcance
}

export class GuardarPermisosDto {
    @Type(() => PermisoPantallaDto)
    permisos: PermisoPantallaDto[]
}