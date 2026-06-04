import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConstanciaRetiro } from './constancia-retiro.entity';
import { Retiro } from '../retiro/retiro.entity';
import { CreateConstanciaRetiroDto } from './dto/create-constancia-retiro.dto';
import { UpdateConstanciaRetiroDto } from './dto/update-constancia-retiro.dto';

@Injectable()
export class ConstanciaRetiroService {
  constructor(
    @InjectRepository(ConstanciaRetiro)
    private readonly constanciaRetiroRepository: Repository<ConstanciaRetiro>,
    @InjectRepository(Retiro)
    private readonly retiroRepository: Repository<Retiro>,
  ) {}

  async create(dto: CreateConstanciaRetiroDto) {
    const constanciaRetiro = this.constanciaRetiroRepository.create(dto);
    const saved = await this.constanciaRetiroRepository.save(constanciaRetiro);
    await this.retiroRepository.update(dto.retiroId, {
      fechaRetiro: new Date(dto.fechaEmision ?? new Date()),
    });
    return saved;
  }

  findAll() {
    return this.constanciaRetiroRepository.find({
      where: { isActive: true },
      relations: ['retiro', 'tecnico'],
    });
  }

  async findOne(id: number) {
    const constanciaRetiro = await this.constanciaRetiroRepository.findOne({
      where: { id },
      relations: ['retiro', 'tecnico'],
    });
    if (!constanciaRetiro) throw new NotFoundException(`ConstanciaRetiro ${id} no encontrada`);
    return constanciaRetiro;
  }

  async update(id: number, dto: UpdateConstanciaRetiroDto) {
    const existing = await this.findOne(id);
    await this.constanciaRetiroRepository.update(id, dto);
    if (dto.fechaEmision !== undefined) {
      await this.retiroRepository.update(existing.retiroId, {
        fechaRetiro: new Date(dto.fechaEmision),
      });
    }
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.constanciaRetiroRepository.update(id, { isActive: false });
    return { message: 'ConstanciaRetiro desactivada' };
  }
}
