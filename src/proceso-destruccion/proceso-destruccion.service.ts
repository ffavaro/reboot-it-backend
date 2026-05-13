import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProcesoDestruccion } from './proceso-destruccion.entity';
import { CreateProcesoDestruccionDto } from './dto/create-proceso-destruccion.dto';
import { UpdateProcesoDestruccionDto } from './dto/update-proceso-destruccion.dto';

@Injectable()
export class ProcesoDestruccionService {
  constructor(
    @InjectRepository(ProcesoDestruccion)
    private readonly procesoDestruccionRepository: Repository<ProcesoDestruccion>,
  ) {}

  create(dto: CreateProcesoDestruccionDto) {
    const procesoDestruccion = this.procesoDestruccionRepository.create(dto);
    return this.procesoDestruccionRepository.save(procesoDestruccion);
  }

  findAll() {
    return this.procesoDestruccionRepository.find({
      where: { isActive: true },
      relations: ['medioAlmacenamiento', 'empleado'],
    });
  }

  async findOne(id: number) {
    const procesoDestruccion = await this.procesoDestruccionRepository.findOne({
      where: { id },
      relations: ['medioAlmacenamiento', 'empleado'],
    });
    if (!procesoDestruccion) throw new NotFoundException(`ProcesoDestruccion ${id} no encontrado`);
    return procesoDestruccion;
  }

  async update(id: number, dto: UpdateProcesoDestruccionDto) {
    await this.findOne(id);
    await this.procesoDestruccionRepository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.procesoDestruccionRepository.update(id, { isActive: false });
    return { message: 'ProcesoDestruccion desactivado' };
  }
}
