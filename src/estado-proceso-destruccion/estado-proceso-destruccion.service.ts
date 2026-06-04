import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EstadoProcesoDestruccion } from './estado-proceso-destruccion.entity';
import { CreateEstadoProcesoDestruccionDto } from './dto/create-estado-proceso-destruccion.dto';
import { UpdateEstadoProcesoDestruccionDto } from './dto/update-estado-proceso-destruccion.dto';

@Injectable()
export class EstadoProcesoDestruccionService {
  constructor(
    @InjectRepository(EstadoProcesoDestruccion)
    private readonly repo: Repository<EstadoProcesoDestruccion>,
  ) {}

  create(dto: CreateEstadoProcesoDestruccionDto) {
    return this.repo.save(this.repo.create(dto));
  }

  findAll() {
    return this.repo.find({ where: { isActive: true } });
  }

  async findOne(id: number) {
    const estado = await this.repo.findOne({ where: { id } });
    if (!estado) throw new NotFoundException(`EstadoProcesoDestruccion ${id} no encontrado`);
    return estado;
  }

  async update(id: number, dto: UpdateEstadoProcesoDestruccionDto) {
    await this.findOne(id);
    await this.repo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.repo.update(id, { isActive: false });
    return { message: 'EstadoProcesoDestruccion desactivado' };
  }
}
