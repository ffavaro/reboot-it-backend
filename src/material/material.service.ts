import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Material } from './material.entity';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';

@Injectable()
export class MaterialService {
  constructor(
    @InjectRepository(Material)
    private readonly materialRepository: Repository<Material>,
  ) {}

  create(dto: CreateMaterialDto) {
    const material = this.materialRepository.create(dto);
    return this.materialRepository.save(material);
  }

  findAll() {
    return this.materialRepository.find({
      where: { isActive: true },
      relations: ['lote', 'tipoMaterial', 'condicionMaterial'],
    });
  }

  async findOne(id: number) {
    const material = await this.materialRepository.findOne({
      where: { id },
      relations: ['lote', 'tipoMaterial', 'condicionMaterial'],
    });
    if (!material) throw new NotFoundException(`Material ${id} no encontrado`);
    return material;
  }

  async update(id: number, dto: UpdateMaterialDto) {
    await this.findOne(id);
    await this.materialRepository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.materialRepository.update(id, { isActive: false });
    return { message: 'Material desactivado' };
  }
}
