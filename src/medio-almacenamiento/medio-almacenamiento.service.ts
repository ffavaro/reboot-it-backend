import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MedioAlmacenamiento } from './medio-almacenamiento.entity';
import { CreateMedioAlmacenamientoDto } from './dto/create-medio-almacenamiento.dto';
import { UpdateMedioAlmacenamientoDto } from './dto/update-medio-almacenamiento.dto';

@Injectable()
export class MedioAlmacenamientoService {
  constructor(
    @InjectRepository(MedioAlmacenamiento)
    private readonly medioAlmacenamientoRepository: Repository<MedioAlmacenamiento>,
  ) {}

  create(dto: CreateMedioAlmacenamientoDto) {
    const medioAlmacenamiento = this.medioAlmacenamientoRepository.create(dto);
    return this.medioAlmacenamientoRepository.save(medioAlmacenamiento);
  }

  findAll() {
    return this.medioAlmacenamientoRepository.find({
      where: { isActive: true },
      relations: ['material'],
    });
  }

  async findOne(id: number) {
    const medioAlmacenamiento = await this.medioAlmacenamientoRepository.findOne({
      where: { id },
      relations: ['material'],
    });
    if (!medioAlmacenamiento) throw new NotFoundException(`MedioAlmacenamiento ${id} no encontrado`);
    return medioAlmacenamiento;
  }

  async update(id: number, dto: UpdateMedioAlmacenamientoDto) {
    await this.findOne(id);
    await this.medioAlmacenamientoRepository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.medioAlmacenamientoRepository.update(id, { isActive: false });
    return { message: 'MedioAlmacenamiento desactivado' };
  }
}
