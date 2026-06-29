import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Retiro } from './retiro.entity';
import { CreateRetiroDto } from './dto/create-retiro.dto';
import { UpdateRetiroDto } from './dto/update-retiro.dto';
import { ReporteRetiroDto } from './dto/reporte-retiro.dto';

@Injectable()
export class RetiroService {
  constructor(
    @InjectRepository(Retiro)
    private readonly retiroRepository: Repository<Retiro>,
  ) {}

  create(dto: CreateRetiroDto) {
    const retiro = this.retiroRepository.create(dto);
    return this.retiroRepository.save(retiro);
  }

  findAll() {
    return this.retiroRepository.find({
      where: { isActive: true },
      relations: ['donacion', 'empleadoTransportista', 'empleadoTransportista.empleado', 'vehiculo'],
    });
  }

  async findOne(id: number) {
    const retiro = await this.retiroRepository.findOne({
      where: { id },
      relations: ['donacion', 'empleadoTransportista', 'empleadoTransportista.empleado', 'vehiculo'],
    });
    if (!retiro) throw new NotFoundException(`Retiro ${id} no encontrado`);
    return retiro;
  }

  async update(id: number, dto: UpdateRetiroDto) {
    await this.findOne(id);
    await this.retiroRepository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.retiroRepository.update(id, { isActive: false });
    return { message: 'Retiro desactivado' };
  }

  async reporte(query: ReporteRetiroDto) {
    const qb = this.retiroRepository
      .createQueryBuilder('r')
      .leftJoinAndSelect('r.donacion', 'donacion')
      .leftJoinAndSelect('donacion.donante', 'donante')
      .leftJoinAndSelect('donacion.estadoDonacion', 'estadoDonacion')
      .leftJoinAndSelect('r.empleadoTransportista', 'transportista')
      .leftJoinAndSelect('transportista.empleado', 'empleado')
      .leftJoinAndSelect('r.vehiculo', 'vehiculo')
      .where('r.isActive = :active', { active: true });

    if (query.donanteId) {
      qb.andWhere('donacion.donanteId = :donanteId', { donanteId: query.donanteId });
    }
    if (query.empleadoTransportistaId) {
      qb.andWhere('r.empleadoTransportistaId = :empleadoTransportistaId', {
        empleadoTransportistaId: query.empleadoTransportistaId,
      });
    }
    if (query.estadoDonacionId) {
      qb.andWhere('donacion.estadoDonacionId = :estadoDonacionId', {
        estadoDonacionId: query.estadoDonacionId,
      });
    }
    if (query.fechaDesde) {
      qb.andWhere('r.fechaInicio >= :fechaDesde', { fechaDesde: query.fechaDesde });
    }
    if (query.fechaHasta) {
      qb.andWhere('r.fechaInicio <= :fechaHasta', { fechaHasta: `${query.fechaHasta}T23:59:59` });
    }

    return qb.orderBy('r.fechaInicio', 'DESC').getMany();
  }
}
