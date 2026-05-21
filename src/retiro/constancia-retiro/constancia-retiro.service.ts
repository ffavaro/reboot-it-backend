import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConstanciaRetiro } from './constancia-retiro.entity';
import { CreateConstanciaRetiroDto } from './dto/create-constancia-retiro.dto';
import { UpdateConstanciaRetiroDto } from './dto/update-constancia-retiro.dto';

@Injectable()
export class ConstanciaRetiroService {
  constructor(
    @InjectRepository(ConstanciaRetiro)
    private readonly constanciaRetiroRepository: Repository<ConstanciaRetiro>,
  ) {}

  create(dto: CreateConstanciaRetiroDto) {
    const constanciaRetiro = this.constanciaRetiroRepository.create(dto);
    return this.constanciaRetiroRepository.save(constanciaRetiro);
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
    await this.findOne(id);
    await this.constanciaRetiroRepository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.constanciaRetiroRepository.update(id, { isActive: false });
    return { message: 'ConstanciaRetiro desactivada' };
  }
}
