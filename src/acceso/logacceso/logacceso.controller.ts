import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateLogAccesoDto } from './dto/create-logacceso.dto';
import { LogAccesoService } from './logacceso.service';

@ApiTags('logacceso')
@Controller('logacceso')
export class LogAccesoController {
  constructor(private readonly logAccesoService: LogAccesoService) {}

  @Post()
  @ApiOperation({ summary: 'Registrar un log de acceso manualmente' })
  create(@Body() dto: CreateLogAccesoDto) {
    return this.logAccesoService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los logs de acceso' })
  findAll() {
    return this.logAccesoService.findAll();
  }

  @Get('usuario/:id')
  @ApiOperation({ summary: 'Obtener logs de acceso de un usuario' })
  findByUsuario(@Param('id') id: string) {
    return this.logAccesoService.findByUsuario(+id);
  }
}
