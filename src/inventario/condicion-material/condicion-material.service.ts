import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CondicionMaterial } from './condicion-material.entity';
import { CreateCondicionMaterialDto } from './dto/create-condicion-material.dto';
import { UpdateCondicionMaterialDto } from './dto/update-condicion-material.dto';

@Injectable()
export class CondicionMaterialService {
  constructor(
    @InjectRepository(CondicionMaterial)
    private readonly condicionMaterialRepository: Repository<CondicionMaterial>,
  ) {}

  create(dto: CreateCondicionMaterialDto) {
    const condicionMaterial = this.condicionMaterialRepository.create(dto);
    return this.condicionMaterialRepository.save(condicionMaterial);
  }

  findAll() {
    return this.condicionMaterialRepository.find({ where: { isActive: true } });
  }

  async findOne(id: number) {
    const condicionMaterial = await this.condicionMaterialRepository.findOne({ where: { id } });
    if (!condicionMaterial) throw new NotFoundException(`CondicionMaterial ${id} no encontrada`);
    return condicionMaterial;
  }

  async update(id: number, dto: UpdateCondicionMaterialDto) {
    await this.findOne(id);
    await this.condicionMaterialRepository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.condicionMaterialRepository.update(id, { isActive: false });
    return { message: 'CondicionMaterial desactivada' };
  }
}
