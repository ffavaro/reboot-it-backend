import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Marca } from './marca.entity';
import { CreateMarcaDto } from './dto/create-marca.dto';
import { UpdateMarcaDto } from './dto/update-marca.dto';

@Injectable()
export class MarcaService {
  constructor(
    @InjectRepository(Marca)
    private readonly marcaRepository: Repository<Marca>,
  ) {}

  create(dto: CreateMarcaDto) {
    const marca = this.marcaRepository.create(dto);
    return this.marcaRepository.save(marca);
  }

  findAll() {
    return this.marcaRepository.find({ where: { isActive: true } });
  }

  async findOne(id: number) {
    const marca = await this.marcaRepository.findOne({ where: { id } });
    if (!marca) throw new NotFoundException(`Marca ${id} no encontrada`);
    return marca;
  }

  async update(id: number, dto: UpdateMarcaDto) {
    await this.findOne(id);
    await this.marcaRepository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.marcaRepository.update(id, { isActive: false });
    return { message: 'Marca desactivada' };
  }
}
