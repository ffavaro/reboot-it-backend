import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Donacion } from './donacion.entity';
import { CreateDonacionDto } from './dto/create-donacion.dto';
import { UpdateDonacionDto } from './dto/update-donacion.dto';

@Injectable()
export class DonacionService {
  constructor(
    @InjectRepository(Donacion)
    private readonly donacionRepository: Repository<Donacion>,
  ) {}

  create(dto: CreateDonacionDto) {
    const donacion = this.donacionRepository.create(dto);
    return this.donacionRepository.save(donacion);
  }

  findAll() {
    return this.donacionRepository.find({
      where: { isActive: true },
      relations: ['donante'],
    });
  }

  async findOne(id: number) {
    const donacion = await this.donacionRepository.findOne({
      where: { id },
      relations: ['donante'],
    });
    if (!donacion) throw new NotFoundException(`Donacion ${id} no encontrada`);
    return donacion;
  }

  async update(id: number, dto: UpdateDonacionDto) {
    await this.findOne(id);
    await this.donacionRepository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.donacionRepository.update(id, { isActive: false });
    return { message: 'Donacion desactivada' };
  }
}
