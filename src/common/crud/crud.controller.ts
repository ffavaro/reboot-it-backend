import {
  Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Type, ValidationPipe,
} from '@nestjs/common';
import { Public } from '../../auth/public.decorator';
import { Pantalla, SoloAutenticado } from '../../auth/permisos.decorators';
import { CrudService } from './crud-service';
import { Acceso, CrudController, CrudControllerOptions } from './crud.interface';

// Obtento el tipo de acceo a la pantalla y valido sie sta autentificado
const acceso = (a: Acceso | undefined, pantalla: string) =>
  a === 'publico' ? Public()
  : a === 'autenticado' ? SoloAutenticado()
  : Pantalla(...(a ?? [pantalla]));

export function createCrudController(o: CrudControllerOptions): Type<CrudController> {
  const validar = (dto: Type<unknown>) =>
    new ValidationPipe({ whitelist: true, transform: true, expectedType: dto });

  const accesoListado = acceso(o.listado ?? o.lectura, o.pantalla);
  const accesoDetalle = acceso(o.detalle ?? o.lectura, o.pantalla);

  @Pantalla(o.pantalla)
  @Controller(o.path)
  class CrudControllerBase implements CrudController {
    constructor(protected readonly service: CrudService<any, any, any>) {}

    @Post()
    create(@Body(validar(o.createDto)) dto: unknown) {
      return this.service.create(dto);
    }

    @accesoListado
    @Get()
    findAll() {
      return this.service.findAll();
    }

    @accesoDetalle
    @Get(':id')
     findOne(@Param('id', ParseIntPipe) id: number) {
      return this.service.findOne(id);
    }

    @Patch(':id')
     update(@Param('id', ParseIntPipe) id: number, @Body(validar(o.updateDto)) dto: unknown) {
      return this.service.update(id, dto);
    }

    @Delete(':id')
      remove(@Param('id', ParseIntPipe) id: number) {
      return this.service.remove(id);
    }
  }

  return CrudControllerBase;
}
