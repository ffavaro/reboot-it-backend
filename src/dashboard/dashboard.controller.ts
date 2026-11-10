import { Controller, Get, Query, Req } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { DashboardQueryDto } from './dto/create-dashboard.dto';
import { Pantalla } from '../auth/permisos.decorators';
import type { RequestConUsuario } from '@app/interfaces/auth.type';

@Pantalla('dashboard')
@ApiTags('dashboard')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('resumen')
  @ApiOperation({
    summary: 'Indicadores y gráficos del dashboard para un período',
  })
  resumen(@Query() query: DashboardQueryDto, @Req() req: RequestConUsuario) {
      return this.dashboardService.resumen(query, req.acceso?.alcance === 'TODOS');
  }
}
