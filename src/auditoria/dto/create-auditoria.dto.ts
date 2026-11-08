import { IsOptional } from "class-validator";

export class CreateAuditoriaDto {
    usuarioId?:number;

    fechaDesde?:string;

    fechaHasta?:string;

    accion?:string;

    resultado?:string;

    entidad?:string;

    @IsOptional()
    page?:string | number;
    
    @IsOptional()
    limit?:string | number;
}
