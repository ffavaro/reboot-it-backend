import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Donante } from './donante.entity';
import { CreateDonanteDto } from './dto/create-donante.dto';
import { UpdateDonanteDto } from './dto/update-donante.dto';

@Injectable()
export class DonantesService {
  constructor(
    @InjectRepository(Donante)
    private readonly donanteRepository: Repository<Donante>,
  ) {}

  create(dto: CreateDonanteDto) {
    const donante = this.donanteRepository.create(dto);
    return this.donanteRepository.save(donante);
  }

  findAll() {
    return this.donanteRepository.find({
      where: { isActive: true },
      relations: ['tipoDonante'],
    });
  }

  async findOne(id: number) {
    const donante = await this.donanteRepository.findOne({
      where: { id },
      relations: ['tipoDonante'],
    });
    if (!donante) throw new NotFoundException(`Donante ${id} no encontrado`);
    return donante;
  }

  async update(id: number, dto: UpdateDonanteDto) {
    await this.findOne(id);
    await this.donanteRepository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.donanteRepository.update(id, { isActive: false });
    return { message: 'Donante desactivado' };
  }
}
