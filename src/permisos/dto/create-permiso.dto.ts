import { IsBoolean, IsInt, Min, ValidateNested } from "class-validator";
import type { Alcance } from "../permisos.constants";
import { Type } from "class-transformer";

export class PermisoPantallaDto {
    @IsInt()
    @Min(1, { message: 'La pantalla debe ser como mínimo 1' })
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
    @ValidateNested({ each: true })
    @Type(() => PermisoPantallaDto)
    permisos: PermisoPantallaDto[]
}