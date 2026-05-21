import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tipo } from './tipo.entity';
import { CreateTipoDto } from './dto/create-tipo.dto';
import { UpdateTipoDto } from './dto/update-tipo.dto';

@Injectable()
export class TipoService {
  constructor(
    @InjectRepository(Tipo)
    private readonly tipoRepository: Repository<Tipo>,
  ) {}

  create(dto: CreateTipoDto) {
    const tipo = this.tipoRepository.create(dto);
    return this.tipoRepository.save(tipo);
  }

  findAll() {
    return this.tipoRepository.find({ where: { isActive: true } });
  }

  async findOne(id: number) {
    const tipo = await this.tipoRepository.findOne({ where: { id } });
    if (!tipo) throw new NotFoundException(`Tipo ${id} no encontrado`);
    return tipo;
  }

  async update(id: number, dto: UpdateTipoDto) {
    await this.findOne(id);
    await this.tipoRepository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.tipoRepository.update(id, { isActive: false });
    return { message: 'Tipo desactivado' };
  }
}
