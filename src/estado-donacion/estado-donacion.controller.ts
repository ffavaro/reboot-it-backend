import {  Controller} from '@nestjs/common';
import { EstadoDonacionService } from './estado-donacion.service';
import { CreateEstadoDonacionDto } from './dto/create-estado-donacion.dto';
import { UpdateEstadoDonacionDto } from './dto/update-estado-donacion.dto';
import { createCrudController } from '@app/common/crud/crud.controller';

@Controller('estado-donacion')
export class EstadoDonacionController extends createCrudController({
  path: "estado-donacion",
  pantalla: "estado_turno",
  sustantivo: "estado-donacion",
  plural: "estados-donacion",
  createDto: CreateEstadoDonacionDto,
  updateDto: UpdateEstadoDonacionDto,
  lectura: ["estado-donacion"]
}) {
  constructor(service: EstadoDonacionService) {
    super(service)
  }
}
