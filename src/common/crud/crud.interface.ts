import { Type } from "@nestjs/common";
import { Repository, FindOptionsOrder } from "typeorm";

export type Acceso = 'publico' | 'autenticado' | string[];

export interface CrudControllerOptions {
    path: string;
    pantalla: string;
    sustantivo: string;
    plural: string;
    createDto: Type<unknown>;
    updateDto: Type<unknown>;
    lectura?: Acceso;
    listado?: Acceso;
    detalle?: Acceso;
}

export interface CrudController {
    create(dto: any): any;
    findAll(): any;
    findOne(id: number): any;
    update(id: number, dto: any): any;
    remove(id: number): any;
}

export interface EntidadCrud {
    id: number,
    isActive: boolean
}

/**
 * Etiqueta que se va a guardar
 * genero, si esta activa o no
 * relaciones, para buscar en el findAll o findone
 * relationOne para el findOne
 * order, para el orden
 */
export interface CrudServiceOption<T> {
    etiqueta: string;
    genero: 'm' | 'f'
    relations?: string[],
    relationsOne?: string[]
    order?: FindOptionsOrder<T>
}

export type DatosUpdate<T extends object> = Parameters<Repository<T>['update']>[1];
