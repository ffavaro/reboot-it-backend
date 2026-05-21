import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lote } from './lote.entity';
import { CreateLoteDto } from './dto/create-lote.dto';
import { UpdateLoteDto } from './dto/update-lote.dto';

@Injectable()
export class LoteService {
  constructor(
    @InjectRepository(Lote)
    private readonly loteRepository: Repository<Lote>,
  ) {}

  create(dto: CreateLoteDto) {
    const lote = this.loteRepository.create(dto);
    return this.loteRepository.save(lote);
  }

  findAll() {
    return this.loteRepository.find({
      where: { isActive: true },
      relations: ['donacion'],
    });
  }

  async findOne(id: number) {
    const lote = await this.loteRepository.findOne({
      where: { id },
      relations: ['donacion'],
    });
    if (!lote) throw new NotFoundException(`Lote ${id} no encontrado`);
    return lote;
  }

  async update(id: number, dto: UpdateLoteDto) {
    await this.findOne(id);
    await this.loteRepository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.loteRepository.update(id, { isActive: false });
    return { message: 'Lote desactivado' };
  }
}
