
export class CreateAuditoriaDto {
    usuarioId?:number;

    fechaDesde?:string;

    fechaHasta?:string;

    accion?:string;

    resultado?:string;

    entidad?:string;

    page?:string | number;

    limit?:string | number;
}
