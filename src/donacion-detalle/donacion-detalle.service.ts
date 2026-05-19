import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DonacionDetalle } from './donacion-detalle.entity';
import { CreateDonacionDetalleDto } from './dto/create-donacion-detalle.dto';
import { UpdateDonacionDetalleDto } from './dto/update-donacion-detalle.dto';

const RELATIONS = ['tipoMaterial'];

@Injectable()
export class DonacionDetalleService {
  constructor(
    @InjectRepository(DonacionDetalle)
    private readonly repo: Repository<DonacionDetalle>,
  ) {}

  create(dto: CreateDonacionDetalleDto) {
    return this.repo.save(this.repo.create(dto));
  }

  findAll() {
    return this.repo.find({ where: { isActive: true }, relations: RELATIONS });
  }

  findByDonacion(donacionId: number) {
    return this.repo.find({
      where: { donacionId, isActive: true },
      relations: RELATIONS,
    });
  }

  async findOne(id: number) {
    const detalle = await this.repo.findOne({ where: { id }, relations: RELATIONS });
    if (!detalle) throw new NotFoundException(`DonacionDetalle ${id} no encontrado`);
    return detalle;
  }

  async update(id: number, dto: UpdateDonacionDetalleDto) {
    await this.findOne(id);
    await this.repo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.repo.update(id, { isActive: false });
    return { message: 'DonacionDetalle desactivado' };
  }
}
