import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { NoAuditar } from '@app/auditoria/acciones';
import { AuditoriaService } from './auditoria.service';
import { ListarAuditoriaDto } from './dto/listar-auditoria.dto';

@NoAuditar()
@ApiTags('auditoria')
@Controller('auditoria')
export class AuditoriaController {
  constructor(private readonly auditoriaService: AuditoriaService) {}

  @Get('acciones')
  @ApiOperation({
    summary: 'Acciones registradas, para el filtro de la pantalla',
  })
  acciones() {
    return this.auditoriaService.acciones();
  }

  @Get()
  @ApiOperation({
    summary:
      'Registro de auditoría paginado, filtrable por usuario, fechas, acción, resultado y entidad',
  })
  listar(@Query() filtros: ListarAuditoriaDto) {
    return this.auditoriaService.buscar(filtros);
  }
}
