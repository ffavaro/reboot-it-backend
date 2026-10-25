import { Controller, Get, Query, Req } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Pantalla } from '../auth/auth.decorators';
import type { RequestConUsuario } from '../auth/auth-user';
import { DashboardService } from './dashboard.service';
import { DashboardQueryDto } from './dto/dashboard-query.dto';

@Pantalla('dashboard')
@ApiTags('dashboard')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('resumen')
  @ApiOperation({ summary: 'Indicadores y gráficos del dashboard (el Técnico recibe solo los de planta)' })
  resumen(@Query() query: DashboardQueryDto, @Req() req: RequestConUsuario) {
    return this.dashboardService.resumen(query, req.permiso?.alcance === 'PLENO');
  }
}
