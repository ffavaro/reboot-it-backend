import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Clasificacion } from './clasificacion.entity';
import { CreateClasificacionDto } from './dto/create-clasificacion.dto';
import { UpdateClasificacionDto } from './dto/update-clasificacion.dto';

@Injectable()
export class ClasificacionService {
  constructor(
    @InjectRepository(Clasificacion)
    private readonly clasificacionRepository: Repository<Clasificacion>,
  ) {}

  create(dto: CreateClasificacionDto) {
    const clasificacion = this.clasificacionRepository.create(dto);
    return this.clasificacionRepository.save(clasificacion);
  }

  findAll() {
    return this.clasificacionRepository.find({
      where: { isActive: true },
      relations: ['lote', 'empleado'],
    });
  }

  async findOne(id: number) {
    const clasificacion = await this.clasificacionRepository.findOne({
      where: { id },
      relations: ['lote', 'empleado'],
    });
    if (!clasificacion) throw new NotFoundException(`Clasificacion ${id} no encontrada`);
    return clasificacion;
  }

  async update(id: number, dto: UpdateClasificacionDto) {
    await this.findOne(id);
    await this.clasificacionRepository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.clasificacionRepository.update(id, { isActive: false });
    return { message: 'Clasificacion desactivada' };
  }
}
