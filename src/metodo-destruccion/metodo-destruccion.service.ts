import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MetodoDestruccion } from './metodo-destruccion.entity';
import { CreateMetodoDestruccionDto } from './dto/create-metodo-destruccion.dto';
import { UpdateMetodoDestruccionDto } from './dto/update-metodo-destruccion.dto';

@Injectable()
export class MetodoDestruccionService {
  constructor(
    @InjectRepository(MetodoDestruccion)
    private readonly repo: Repository<MetodoDestruccion>,
  ) {}

  create(dto: CreateMetodoDestruccionDto) {
    return this.repo.save(this.repo.create(dto));
  }

  findAll() {
    return this.repo.find({ where: { isActive: true } });
  }

  async findOne(id: number) {
    const metodo = await this.repo.findOne({ where: { id } });
    if (!metodo) throw new NotFoundException(`MetodoDestruccion ${id} no encontrado`);
    return metodo;
  }

  async update(id: number, dto: UpdateMetodoDestruccionDto) {
    await this.findOne(id);
    await this.repo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.repo.update(id, { isActive: false });
    return { message: 'MetodoDestruccion desactivado' };
  }
}
