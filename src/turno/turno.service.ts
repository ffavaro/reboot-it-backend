import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Turno } from './turno.entity';
import { CreateTurnoDto } from './dto/create-turno.dto';
import { UpdateTurnoDto } from './dto/update-turno.dto';

@Injectable()
export class TurnoService {
  constructor(
    @InjectRepository(Turno)
    private readonly turnoRepository: Repository<Turno>,
  ) {}

  create(dto: CreateTurnoDto) {
    const turno = this.turnoRepository.create(dto);
    return this.turnoRepository.save(turno);
  }

  findAll() {
    return this.turnoRepository.find({
      where: { isActive: true },
      relations: ['donante', 'estadoTurno'],
    });
  }

  async findOne(id: number) {
    const turno = await this.turnoRepository.findOne({
      where: { id },
      relations: ['donante', 'estadoTurno'],
    });
    if (!turno) throw new NotFoundException(`Turno ${id} no encontrado`);
    return turno;
  }

  async update(id: number, dto: UpdateTurnoDto) {
    await this.findOne(id);
    await this.turnoRepository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.turnoRepository.update(id, { isActive: false });
    return { message: 'Turno desactivado' };
  }
}
