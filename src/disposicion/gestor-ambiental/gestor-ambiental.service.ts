import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GestorAmbiental } from './gestor-ambiental.entity';
import { CreateGestorAmbientalDto } from './dto/create-gestor-ambiental.dto';
import { UpdateGestorAmbientalDto } from './dto/update-gestor-ambiental.dto';

@Injectable()
export class GestorAmbientalService {
  constructor(
    @InjectRepository(GestorAmbiental)
    private readonly gestorAmbientalRepository: Repository<GestorAmbiental>,
  ) {}

  create(dto: CreateGestorAmbientalDto) {
    const gestorAmbiental = this.gestorAmbientalRepository.create(dto);
    return this.gestorAmbientalRepository.save(gestorAmbiental);
  }

  findAll() {
    return this.gestorAmbientalRepository.find({ where: { isActive: true } });
  }

  async findOne(id: number) {
    const gestorAmbiental = await this.gestorAmbientalRepository.findOne({ where: { id } });
    if (!gestorAmbiental) throw new NotFoundException(`GestorAmbiental ${id} no encontrado`);
    return gestorAmbiental;
  }

  async update(id: number, dto: UpdateGestorAmbientalDto) {
    await this.findOne(id);
    await this.gestorAmbientalRepository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.gestorAmbientalRepository.update(id, { isActive: false });
    return { message: 'GestorAmbiental desactivado' };
  }
}
