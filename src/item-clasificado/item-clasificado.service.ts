import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ItemClasificado } from './item-clasificado.entity';
import { CreateItemClasificadoDto } from './dto/create-item-clasificado.dto';
import { UpdateItemClasificadoDto } from './dto/update-item-clasificado.dto';

const RELATIONS = ['tipoMaterial', 'condicionMaterial', 'turnoDetalle'];

@Injectable()
export class ItemClasificadoService {
  constructor(
    @InjectRepository(ItemClasificado)
    private readonly repo: Repository<ItemClasificado>,
  ) {}

  create(dto: CreateItemClasificadoDto) {
    return this.repo.save(this.repo.create(dto));
  }

  findAll() {
    return this.repo.find({ where: { isActive: true }, relations: RELATIONS });
  }

  findByClasificacion(clasificacionId: number) {
    return this.repo.find({
      where: { clasificacionId, isActive: true },
      relations: RELATIONS,
    });
  }

  async findOne(id: number) {
    const item = await this.repo.findOne({ where: { id }, relations: RELATIONS });
    if (!item) throw new NotFoundException(`ItemClasificado ${id} no encontrado`);
    return item;
  }

  async update(id: number, dto: UpdateItemClasificadoDto) {
    await this.findOne(id);
    await this.repo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.repo.update(id, { isActive: false });
    return { message: 'ItemClasificado desactivado' };
  }
}
