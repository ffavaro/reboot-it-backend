import { Injectable } from '@nestjs/common';
import { IndicadoresService } from './consultas/indicadores.service';
import { GraficosService } from './consultas/graficos.services';
import { DashboardQueryDto } from './dto/create-dashboard.dto';
import { Filtros, armarFiltros } from '@app/interfaces/dashboard.type';

@Injectable()
export class DashboardService {
  constructor(
    private readonly indicadores: IndicadoresService,
    private readonly graficos: GraficosService,
  ) { }

  resumen = async (query: DashboardQueryDto, completo = true) => {
    const filtros = armarFiltros(query);
    const planta = await this.datosDePlanta(filtros, completo);
    if (!completo) {
      return {
        completo,
        desde: filtros.desde,
        hasta: filtros.hasta,
        pendiente: planta.pendiente,
        ciclo: null,
        reutilizacion: planta.reutilizacion,
        kgProcesados: planta.kgProcesados,
        medios: planta.medios,
        donantes: null,
        kmPorRetiro: null,
        retiroDomicilio: null,
        graficos: {
          cicloPorEtapa: null,
          destinoPorTipo: planta.destinoPorTipo,
          demandaTurnos: [],
          mapaDonantes: [],
          kgPorMesYTipo: [],
          destruccionPorMetodoYMedio: planta.destruccionPorMetodoYMedio,
          eficienciaRutas: [],
        },
      };
    }

    const [
      ciclos,
      donantes,
      kmPorRetiro,
      retiroDomicilio,
      demandaTurnos,
      mapaDonantes,
      kgPorMesYTipo,
      eficienciaRutas,
    ] = await Promise.all([
      this.graficos.ciclos(filtros),
      this.indicadores.donantesRecurrentes(filtros),
      this.indicadores.kmPorRetiro(filtros),
      this.indicadores.retiroDomicilio(filtros),
      this.graficos.demandaTurnos(filtros),
      this.graficos.mapaDonantes(filtros),
      this.graficos.kgPorMesYTipo(filtros),
      this.graficos.eficienciaRutas(filtros),
    ]);

    return {
      completo,
      desde: filtros.desde,
      hasta: filtros.hasta,
      pendiente: planta.pendiente,
      ciclo: ciclos.indicador,
      reutilizacion: planta.reutilizacion,
      kgProcesados: planta.kgProcesados,
      medios: planta.medios,
      donantes,
      kmPorRetiro,
      retiroDomicilio,
      graficos: {
        cicloPorEtapa: ciclos.porEtapa,
        destinoPorTipo: planta.destinoPorTipo,
        demandaTurnos,
        mapaDonantes,
        kgPorMesYTipo,
        destruccionPorMetodoYMedio: planta.destruccionPorMetodoYMedio,
        eficienciaRutas,
      },
    };
  }

  private async datosDePlanta(filtros: Filtros, completo: boolean) {
    const [
      pendiente,
      reutilizacion,
      kgProcesados,
      medios,
      destinoPorTipo,
      destruccionPorMetodoYMedio,
    ] = await Promise.all([
      this.indicadores.trabajoPendiente(completo),
      this.indicadores.reutilizacion(filtros),
      this.indicadores.kgProcesados(filtros),
      this.indicadores.mediosDestruidos(filtros),
      this.graficos.destinoPorTipo(filtros),
      this.graficos.destruccionPorMetodoYMedio(filtros),
    ]);
    return {
      pendiente,
      reutilizacion,
      kgProcesados,
      medios,
      destinoPorTipo,
      destruccionPorMetodoYMedio,
    };
  }

}
