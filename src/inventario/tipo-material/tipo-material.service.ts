import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TipoMaterial } from './tipo-material.entity';
import { CreateTipoMaterialDto } from './dto/create-tipo-material.dto';
import { UpdateTipoMaterialDto } from './dto/update-tipo-material.dto';

@Injectable()
export class TipoMaterialService {
  constructor(
    @InjectRepository(TipoMaterial)
    private readonly tipoMaterialRepository: Repository<TipoMaterial>,
  ) {}

  create(dto: CreateTipoMaterialDto) {
    const tipoMaterial = this.tipoMaterialRepository.create(dto);
    return this.tipoMaterialRepository.save(tipoMaterial);
  }

  findAll() {
    return this.tipoMaterialRepository.find({ where: { isActive: true } });
  }

  async findOne(id: number) {
    const tipoMaterial = await this.tipoMaterialRepository.findOne({ where: { id } });
    if (!tipoMaterial) throw new NotFoundException(`TipoMaterial ${id} no encontrado`);
    return tipoMaterial;
  }

  async update(id: number, dto: UpdateTipoMaterialDto) {
    await this.findOne(id);
    await this.tipoMaterialRepository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.tipoMaterialRepository.update(id, { isActive: false });
    return { message: 'TipoMaterial desactivado' };
  }
}
