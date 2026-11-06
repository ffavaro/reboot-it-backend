import { Controller, Get, Query } from '@nestjs/common';
import { AuditoriaService } from './auditoria.service';
import { CreateAuditoriaDto } from './dto/create-auditoria.dto';

@Controller('auditoria')
export class AuditoriaController {
  constructor(private readonly auditoriaService: AuditoriaService) {}

  @Get('acciones')
  findAcciones() {
    return this.auditoriaService.obtenerAccionesUnicas();
  }
  
  @Get('')
  listar(@Query() filtros: CreateAuditoriaDto) {
    return this.auditoriaService.findAcciones(filtros);
  }
}
