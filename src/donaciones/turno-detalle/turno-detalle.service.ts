import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TurnoDetalle } from './turno-detalle.entity';
import { CreateTurnoDetalleDto } from './dto/create-turno-detalle.dto';
import { UpdateTurnoDetalleDto } from './dto/update-turno-detalle.dto';

const RELATIONS = ['donacionDetalle', 'tipoMaterial'];

@Injectable()
export class TurnoDetalleService {
  constructor(
    @InjectRepository(TurnoDetalle)
    private readonly repo: Repository<TurnoDetalle>,
  ) {}

  create(dto: CreateTurnoDetalleDto) {
    return this.repo.save(this.repo.create(dto));
  }

  findAll() {
    return this.repo.find({ where: { isActive: true }, relations: RELATIONS });
  }

  findByTurno(turnoId: number) {
    return this.repo.find({
      where: { turnoId, isActive: true },
      relations: RELATIONS,
    });
  }

  async findOne(id: number) {
    const detalle = await this.repo.findOne({ where: { id }, relations: RELATIONS });
    if (!detalle) throw new NotFoundException(`TurnoDetalle ${id} no encontrado`);
    return detalle;
  }

  async update(id: number, dto: UpdateTurnoDetalleDto) {
    await this.findOne(id);
    await this.repo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.repo.update(id, { isActive: false });
    return { message: 'TurnoDetalle desactivado' };
  }
}
