import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EstadoDonacion } from './estado-donacion.entity';
import { CreateEstadoDonacionDto } from './dto/create-estado-donacion.dto';
import { UpdateEstadoDonacionDto } from './dto/update-estado-donacion.dto';

@Injectable()
export class EstadoDonacionService {
  constructor(
    @InjectRepository(EstadoDonacion)
    private readonly repo: Repository<EstadoDonacion>,
  ) {}

  create(dto: CreateEstadoDonacionDto) {
    return this.repo.save(this.repo.create(dto));
  }

  findAll() {
    return this.repo.find({ where: { isActive: true } });
  }

  async findOne(id: number) {
    const estado = await this.repo.findOne({ where: { id } });
    if (!estado) throw new NotFoundException(`EstadoDonacion ${id} no encontrado`);
    return estado;
  }

  async update(id: number, dto: UpdateEstadoDonacionDto) {
    await this.findOne(id);
    await this.repo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.repo.update(id, { isActive: false });
    return { message: 'EstadoDonacion desactivado' };
  }
}
