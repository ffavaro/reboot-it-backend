import { Controller } from '@nestjs/common';
import { EstadoProcesoDestruccionService } from './estado-proceso-destruccion.service';
import { CreateEstadoProcesoDestruccionDto } from './dto/create-estado-proceso-destruccion.dto';
import { UpdateEstadoProcesoDestruccionDto } from './dto/update-estado-proceso-destruccion.dto';
import { createCrudController } from '@app/common/crud/crud.controller';

@Controller('estado-proceso-destruccion')
export class EstadoProcesoDestruccionController extends createCrudController({
  path: 'estado-proceso-destruccion',
  pantalla: 'estado_proceso_destruccion',
  sustantivo: "estado-proceso-destruccion",
  plural: "estados-procesos-destruccion",
  createDto: CreateEstadoProcesoDestruccionDto,
  updateDto: UpdateEstadoProcesoDestruccionDto,
  lectura: ['estado_proceso_destruccion', 'proceso_destruccion'],
}) {
  constructor(service: EstadoProcesoDestruccionService) {
    super(service)
  }
}
