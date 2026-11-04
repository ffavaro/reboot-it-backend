import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { GraficosService } from './consultas/graficos.services';
import { IndicadoresService } from './consultas/indicadores.service';
@Module({
  controllers: [DashboardController],
  providers: [DashboardService, GraficosService, IndicadoresService],
})
export class DashboardModule {}
