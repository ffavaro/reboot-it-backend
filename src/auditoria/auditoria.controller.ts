import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ROL, Roles } from '../auth/auth.decorators';
import { AuditoriaService } from './auditoria.service';
import { NoAuditar } from './auditoria.acciones';
import { ListarAuditoriaQueryDto } from './dto/listar-auditoria-query.dto';

// Consultar la auditoría no genera más auditoría
@NoAuditar()
@Roles(ROL.ADMIN)
@ApiTags('auditoria')
@Controller('auditoria')
export class AuditoriaController {
  constructor(private readonly auditoriaService: AuditoriaService) {}

  @Get()
  @ApiOperation({
    summary: 'Registro de auditoría (solo admin), paginado y filtrable por usuario, fechas, acción, resultado y entidad',
  })
  listar(@Query() query: ListarAuditoriaQueryDto) {
    return this.auditoriaService.buscar(query);
  }
}
