import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CrudService } from '@app/common/crud/crud-service';
import { Retiro } from './retiro.entity';
import { CreateRetiroDto } from './dto/create-retiro.dto';
import { UpdateRetiroDto } from './dto/update-retiro.dto';
import { ReporteRetiroDto } from './dto/reporte-retiro.dto';
import { validarPesoDonacionVehiculo } from '../utils/peso-vehiculo';

@Injectable()
export class RetiroService extends CrudService<Retiro, CreateRetiroDto, UpdateRetiroDto> {
  constructor(@InjectRepository(Retiro) repo: Repository<Retiro>) {
    super(repo, {
      etiqueta: 'Retiro',
      genero: 'm',
      relations: ['donacion', 'empleadoTransportista', 'empleadoTransportista.empleado', 'vehiculo'],
      order: { id: 'DESC' },
    });
  }

  async create(dto: CreateRetiroDto) {
    await validarPesoDonacionVehiculo(this.repo.manager, dto.donacionId, dto.vehiculoId);
    return super.create(dto);
  }

  async update(id: number, dto: UpdateRetiroDto) {
    const actual = await this.findOne(id);
    if (dto.donacionId !== undefined || dto.vehiculoId !== undefined) {
      await validarPesoDonacionVehiculo(this.repo.manager, dto.donacionId ?? actual.donacionId, dto.vehiculoId ?? actual.vehiculoId);
    }
    await this.repo.update(id, dto);
    return this.findOne(id);
  }

  async reporte(query: ReporteRetiroDto) {
    const qb = this.repo
      .createQueryBuilder('r')
      .leftJoinAndSelect('r.donacion', 'donacion')
      .leftJoinAndSelect('donacion.donante', 'donante')
      .leftJoinAndSelect('donacion.estadoDonacion', 'estadoDonacion')
      .leftJoinAndSelect('r.empleadoTransportista', 'transportista')
      .leftJoinAndSelect('transportista.empleado', 'empleado')
      .leftJoinAndSelect('r.vehiculo', 'vehiculo')
      .where('r.isActive = :active', { active: true });

    if (query.donanteId) qb.andWhere('donacion.donanteId = :donanteId', { donanteId: query.donanteId });
    if (query.empleadoTransportistaId) qb.andWhere('r.empleadoTransportistaId = :empleadoTransportistaId', { empleadoTransportistaId: query.empleadoTransportistaId });
    if (query.estadoDonacionId) qb.andWhere('donacion.estadoDonacionId = :estadoDonacionId', { estadoDonacionId: query.estadoDonacionId });
    if (query.fechaDesde) qb.andWhere('r.fechaInicio >= :fechaDesde', { fechaDesde: query.fechaDesde });
    if (query.fechaHasta) qb.andWhere('r.fechaInicio <= :fechaHasta', { fechaHasta: `${query.fechaHasta}T23:59:59` });

    return qb.orderBy('r.fechaInicio', 'DESC').getMany();
  }
}
