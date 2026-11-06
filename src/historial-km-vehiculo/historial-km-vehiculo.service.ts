import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { HistorialKmVehiculo } from './entities/historial-km-vehiculo.entity';
import { Vehiculo } from '../vehiculos/vehiculo.entity';
import { CreateHistorialKmVehiculoDto } from './dto/create-historial-km-vehiculo.dto';
import { UpdateHistorialKmVehiculoDto } from './dto/update-historial-km-vehiculo.dto';
import { RangoFechasDto, ReporteUsoDto } from './dto/rango-fechas.dto';
import { FilaUso, UsoVehiculo } from '../interfaces/historial-km-vehiculo.type';

@Injectable()
export class HistorialKmVehiculoService {
  constructor(
    @InjectRepository(HistorialKmVehiculo)
    private readonly historialRepository: Repository<HistorialKmVehiculo>,
    @InjectRepository(Vehiculo)
    private readonly vehiculoRepository: Repository<Vehiculo>,
  ) { }

  async create(dto: CreateHistorialKmVehiculoDto) {
    return this.historialRepository.save(this.historialRepository.create(dto));
  }

  findAll() {
    return this.historialRepository.find({
      order: {id: "DESC"}
    });
  }

  findOne(id: number) {
    return this.historialRepository.findOne({ where: { id } });
  }

  update(id: number, updateHistorialKmVehiculoDto: UpdateHistorialKmVehiculoDto) {
    return this.historialRepository.update(id, updateHistorialKmVehiculoDto);
  }

  remove(id: number) {
    return this.historialRepository.delete(id);
  }

    async historialDeVehiculo(vehiculoId: number, rango: RangoFechasDto) {
    const existe = await this.vehiculoRepository.exists({ where: { id: vehiculoId } });
    if (!existe) throw new NotFoundException(`Vehículo ${vehiculoId} no encontrado`);

    const qb = this.historialRepository
      .createQueryBuilder('h')
      .leftJoinAndSelect('h.vehiculo', 'vehiculo')
      .where('h.vehiculoId = :vehiculoId', { vehiculoId })
      .orderBy('h.createdAt', 'DESC')
      .addOrderBy('h.id', 'DESC');

    return this.entreFechas(qb, rango).getMany();
  }

  async reporteUso({ limite, ...rango }: ReporteUsoDto): Promise<UsoVehiculo[]> {
    const qb = this.historialRepository
      .createQueryBuilder('h')
      .innerJoin('h.vehiculo', 'v')
      .select(['v.id AS id', 'v.patente AS patente', 'v.marca AS marca', 'v.modelo AS modelo'])
      .addSelect('SUM(h.kmFinal - h.kmInicial)', 'kmTotales')
      .addSelect('COUNT(h.id)', 'cantidadRecorridos')
      .where('h.kmFinal IS NOT NULL')
      .groupBy('v.id')
      .addGroupBy('v.patente')
      .addGroupBy('v.marca')
      .addGroupBy('v.modelo')
      .orderBy('kmTotales', 'DESC')
      .addOrderBy('v.patente', 'ASC');

    if (limite) qb.limit(limite);

    const filas = await this.entreFechas(qb, rango).getRawMany<FilaUso>();
    return filas.map((f) => ({
      id: Number(f.id),
      patente: f.patente,
      marca: f.marca,
      modelo: f.modelo,
      kmTotales: Number(f.kmTotales ?? 0),
      cantidadRecorridos: Number(f.cantidadRecorridos),
    }));
  }

  private entreFechas<T extends object>(qb: SelectQueryBuilder<T>, { fechaDesde, fechaHasta }: RangoFechasDto) {
    const desde = fechaDesde?.slice(0, 10);
    const hasta = fechaHasta?.slice(0, 10);
    if (desde && hasta && desde > hasta) {
      throw new BadRequestException('La fecha desde no puede ser posterior a la fecha hasta');
    }
    if (desde) qb.andWhere('h.createdAt >= :desde', { desde });
    if (hasta) qb.andWhere('h.createdAt < DATE_ADD(:hasta, INTERVAL 1 DAY)', { hasta });
    return qb;
  }
}
