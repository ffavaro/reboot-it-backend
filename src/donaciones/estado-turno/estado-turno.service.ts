import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EstadoTurno } from './estado-turno.entity';
import { CreateEstadoTurnoDto } from './dto/create-estado-turno.dto';
import { UpdateEstadoTurnoDto } from './dto/update-estado-turno.dto';

@Injectable()
export class EstadoTurnoService {
  constructor(
    @InjectRepository(EstadoTurno)
    private readonly estadoTurnoRepository: Repository<EstadoTurno>,
  ) {}

  create(dto: CreateEstadoTurnoDto) {
    const estadoTurno = this.estadoTurnoRepository.create(dto);
    return this.estadoTurnoRepository.save(estadoTurno);
  }

  findAll() {
    return this.estadoTurnoRepository.find({ where: { isActive: true } });
  }

  async findOne(id: number) {
    const estadoTurno = await this.estadoTurnoRepository.findOne({ where: { id } });
    if (!estadoTurno) throw new NotFoundException(`EstadoTurno ${id} no encontrado`);
    return estadoTurno;
  }

  async update(id: number, dto: UpdateEstadoTurnoDto) {
    await this.findOne(id);
    await this.estadoTurnoRepository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.estadoTurnoRepository.update(id, { isActive: false });
    return { message: 'EstadoTurno desactivado' };
  }
}
