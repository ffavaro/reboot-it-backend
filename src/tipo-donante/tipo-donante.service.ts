import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TipoDonante } from './tipo-donante.entity';
import { CreateTipoDonanteDto } from './dto/create-tipo-donante.dto';
import { UpdateTipoDonanteDto } from './dto/update-tipo-donante.dto';

@Injectable()
export class TipoDonanteService {
  constructor(
    @InjectRepository(TipoDonante)
    private readonly tipoDonanteRepository: Repository<TipoDonante>,
  ) {}

  create(dto: CreateTipoDonanteDto) {
    const tipo = this.tipoDonanteRepository.create(dto);
    return this.tipoDonanteRepository.save(tipo);
  }

  findAll() {
    return this.tipoDonanteRepository.find({ where: { isActive: true } });
  }

  async findOne(id: number) {
    const tipo = await this.tipoDonanteRepository.findOne({ where: { id } });
    if (!tipo) throw new NotFoundException(`TipoDonante ${id} no encontrado`);
    return tipo;
  }

  async update(id: number, dto: UpdateTipoDonanteDto) {
    await this.findOne(id);
    await this.tipoDonanteRepository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.tipoDonanteRepository.update(id, { isActive: false });
    return { message: 'TipoDonante desactivado' };
  }
}
