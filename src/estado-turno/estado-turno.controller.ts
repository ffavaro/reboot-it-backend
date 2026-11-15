import { Controller } from '@nestjs/common';
import { EstadoTurnoService } from './estado-turno.service';
import { CreateEstadoTurnoDto } from './dto/create-estado-turno.dto';
import { UpdateEstadoTurnoDto } from './dto/update-estado-turno.dto';
import { createCrudController } from '@app/common/crud/crud.controller';

@Controller('estado-turno')
export class EstadoTurnoController extends createCrudController({
  path: 'estado-turno',
  pantalla: 'estado_turno',
  sustantivo: 'estado-turno',
  plural: 'estados-turnos',
  createDto: CreateEstadoTurnoDto,
  updateDto: UpdateEstadoTurnoDto,
   lectura: ['estados'],
}) {
  constructor(estadoTurnoService: EstadoTurnoService) {
    super(estadoTurnoService)
  }
}
