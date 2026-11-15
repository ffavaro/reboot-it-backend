import { Controller } from '@nestjs/common';
import { MetodoDestruccionService } from './metodo-destruccion.service';
import { CreateMetodoDestruccionDto } from './dto/create-metodo-destruccion.dto';
import { UpdateMetodoDestruccionDto } from './dto/update-metodo-destruccion.dto';
import { createCrudController } from '@app/common/crud/crud.controller';

@Controller('metodo-destruccion')
export class MetodoDestruccionController extends createCrudController({
  path: 'metodo-destruccion',
  pantalla: 'metodos_destruccion',
  sustantivo: 'metodo-destruccion',
  plural: 'metodo-destruccion',
  createDto: CreateMetodoDestruccionDto,
  updateDto: UpdateMetodoDestruccionDto,
  lectura: ['metodos_destruccion', 'proceso_destruccion'],
}) {
  constructor(private readonly service: MetodoDestruccionService) {
    super(service)
  }
}
