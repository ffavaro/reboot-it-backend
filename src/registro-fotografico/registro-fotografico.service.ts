import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RegistroFotografico } from './registro-fotografico.entity';
import { CreateRegistroFotograficoDto } from './dto/create-registro-fotografico.dto';
import { UpdateRegistroFotograficoDto } from './dto/update-registro-fotografico.dto';

@Injectable()
export class RegistroFotograficoService {
  constructor(
    @InjectRepository(RegistroFotografico)
    private readonly registroFotograficoRepository: Repository<RegistroFotografico>,
  ) {}

  create(dto: CreateRegistroFotograficoDto) {
    const registroFotografico = this.registroFotograficoRepository.create(dto);
    return this.registroFotograficoRepository.save(registroFotografico);
  }

  findAll() {
    return this.registroFotograficoRepository.find({
      where: { isActive: true },
      relations: ['lote'],
    });
  }

  async findOne(id: number) {
    const registroFotografico = await this.registroFotograficoRepository.findOne({
      where: { id },
      relations: ['lote'],
    });
    if (!registroFotografico) throw new NotFoundException(`RegistroFotografico ${id} no encontrado`);
    return registroFotografico;
  }

  async update(id: number, dto: UpdateRegistroFotograficoDto) {
    await this.findOne(id);
    await this.registroFotograficoRepository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.registroFotograficoRepository.update(id, { isActive: false });
    return { message: 'RegistroFotografico desactivado' };
  }
}
