import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Retiro } from './retiro.entity';
import { CreateRetiroDto } from './dto/create-retiro.dto';
import { UpdateRetiroDto } from './dto/update-retiro.dto';

@Injectable()
export class RetiroService {
  constructor(
    @InjectRepository(Retiro)
    private readonly retiroRepository: Repository<Retiro>,
  ) {}

  create(dto: CreateRetiroDto) {
    const retiro = this.retiroRepository.create(dto);
    return this.retiroRepository.save(retiro);
  }

  findAll() {
    return this.retiroRepository.find({
      where: { isActive: true },
      relations: ['donacion', 'empleadoTransportista', 'vehiculo'],
    });
  }

  async findOne(id: number) {
    const retiro = await this.retiroRepository.findOne({
      where: { id },
      relations: ['donacion', 'empleadoTransportista', 'vehiculo'],
    });
    if (!retiro) throw new NotFoundException(`Retiro ${id} no encontrado`);
    return retiro;
  }

  async update(id: number, dto: UpdateRetiroDto) {
    await this.findOne(id);
    await this.retiroRepository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.retiroRepository.update(id, { isActive: false });
    return { message: 'Retiro desactivado' };
  }
}
