import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HistorialKmVehiculo } from './historial-km-vehiculo.entity';
import { Vehiculo } from '../vehiculos/vehiculo.entity';
import { CreateHistorialKmVehiculoDto } from './dto/create-historial-km-vehiculo.dto';
import { UpdateHistorialKmVehiculoDto } from './dto/update-historial-km-vehiculo.dto';
import { RangoFechas, RangoFechasQueryDto } from './dto/rango-fechas-query.dto';

export interface UsoVehiculo {
  id: number;
  patente: string;
  marca: string;
  modelo: string;
  kmTotales: number;
  cantidadRecorridos: number;
}

// Normaliza fechaDesde/fecha_desde y valida que el rango sea coherente
export function resolverRango(query: RangoFechasQueryDto): RangoFechas {
  const desde = (query.fechaDesde ?? query.fecha_desde)?.slice(0, 10);
  const hasta = (query.fechaHasta ?? query.fecha_hasta)?.slice(0, 10);
  if (desde && hasta && desde > hasta) {
    throw new BadRequestException('La fecha desde no puede ser posterior a la fecha hasta');
  }
  return { desde, hasta };
}

@Injectable()
export class HistorialKmVehiculoService {
  constructor(
    @InjectRepository(HistorialKmVehiculo)
    private readonly historialRepository: Repository<HistorialKmVehiculo>,
    @InjectRepository(Vehiculo)
    private readonly vehiculoRepository: Repository<Vehiculo>,
  ) {}

  private async assertVehiculoExiste(vehiculoId: number) {
    const vehiculo = await this.vehiculoRepository.findOne({ where: { id: vehiculoId } });
    if (!vehiculo) throw new NotFoundException(`Vehículo ${vehiculoId} no encontrado`);
    return vehiculo;
  }

  private assertKms(kmInicial: number, kmFinal?: number | null) {
    if (kmFinal !== undefined && kmFinal !== null && kmFinal < kmInicial) {
      throw new BadRequestException(
        `El kilometraje final (${kmFinal}) no puede ser menor al inicial (${kmInicial})`,
      );
    }
  }

  async create(dto: CreateHistorialKmVehiculoDto) {
    await this.assertVehiculoExiste(dto.vehiculoId);
    this.assertKms(dto.kmInicial, dto.kmFinal);
    return this.historialRepository.save(this.historialRepository.create(dto));
  }

  private listar(vehiculoId: number | undefined, rango: RangoFechas) {
    const qb = this.historialRepository
      .createQueryBuilder('h')
      .leftJoinAndSelect('h.vehiculo', 'vehiculo')
      .orderBy('h.createdAt', 'DESC')
      .addOrderBy('h.id', 'DESC');
    if (vehiculoId) qb.andWhere('h.vehiculoId = :vehiculoId', { vehiculoId });
    if (rango.desde) qb.andWhere('h.createdAt >= :desde', { desde: rango.desde });
    if (rango.hasta) qb.andWhere('h.createdAt < DATE_ADD(:hasta, INTERVAL 1 DAY)', { hasta: rango.hasta });
    return qb.getMany();
  }

  findAll(vehiculoId: number | undefined, query: RangoFechasQueryDto) {
    return this.listar(vehiculoId, resolverRango(query));
  }

  async findByVehiculo(vehiculoId: number, query: RangoFechasQueryDto) {
    await this.assertVehiculoExiste(vehiculoId);
    return this.listar(vehiculoId, resolverRango(query));
  }

  async findOne(id: number) {
    const historial = await this.historialRepository.findOne({ where: { id }, relations: ['vehiculo'] });
    if (!historial) throw new NotFoundException(`Historial de km ${id} no encontrado`);
    return historial;
  }

  async update(id: number, dto: UpdateHistorialKmVehiculoDto) {
    const actual = await this.findOne(id);
    if (dto.vehiculoId !== undefined) await this.assertVehiculoExiste(dto.vehiculoId);
    this.assertKms(dto.kmInicial ?? actual.kmInicial, dto.kmFinal ?? actual.kmFinal);
    await this.historialRepository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    try {
      await this.historialRepository.delete(id);
    } catch (error) {
      // La hoja de ruta que generó el registro lo referencia
      if (error?.code === 'ER_ROW_IS_REFERENCED_2') {
        throw new ConflictException('El registro está asociado a una hoja de ruta y no puede eliminarse');
      }
      throw error;
    }
    return { message: 'Registro de historial eliminado' };
  }

  // Uso por vehículo = suma de (km_final - km_inicial) de los recorridos finalizados del período
  async reporteUso(query: RangoFechasQueryDto, limit?: number): Promise<UsoVehiculo[]> {
    const { desde, hasta } = resolverRango(query);
    const qb = this.historialRepository
      .createQueryBuilder('h')
      .innerJoin('h.vehiculo', 'v')
      .select('v.id', 'id')
      .addSelect('v.patente', 'patente')
      .addSelect('v.marca', 'marca')
      .addSelect('v.modelo', 'modelo')
      .addSelect('SUM(h.kmFinal - h.kmInicial)', 'kmTotales')
      .addSelect('COUNT(h.id)', 'cantidadRecorridos')
      .where('h.kmFinal IS NOT NULL')
      .groupBy('v.id')
      .addGroupBy('v.patente')
      .addGroupBy('v.marca')
      .addGroupBy('v.modelo')
      .orderBy('kmTotales', 'DESC')
      .addOrderBy('v.patente', 'ASC');
    if (desde) qb.andWhere('h.createdAt >= :desde', { desde });
    if (hasta) qb.andWhere('h.createdAt < DATE_ADD(:hasta, INTERVAL 1 DAY)', { hasta });
    if (limit) qb.limit(limit);

    const rows = await qb.getRawMany();
    return rows.map((r) => ({
      id: Number(r.id),
      patente: r.patente,
      marca: r.marca,
      modelo: r.modelo,
      kmTotales: Number(r.kmTotales),
      cantidadRecorridos: Number(r.cantidadRecorridos),
    }));
  }
}
