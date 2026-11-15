import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TurnoDetalle } from './turno-detalle.entity';
import { CreateTurnoDetalleDto } from './dto/create-turno-detalle.dto';
import { UpdateTurnoDetalleDto } from './dto/update-turno-detalle.dto';
import { CrudService } from '@app/common/crud/crud-service';

const RELATIONS = ['donacionDetalle', 'tipoMaterial'];
@Injectable()
export class TurnoDetalleService extends CrudService<
  TurnoDetalle, CreateTurnoDetalleDto, UpdateTurnoDetalleDto
> {
  constructor(@InjectRepository(TurnoDetalle) repo: Repository<TurnoDetalle>) {
    super(repo, { etiqueta: 'TurnoDetalle', genero:'m', relations: RELATIONS });
  }

  findByTurno(turnoId: number) {
    return this.repo.find({ where: { turnoId, isActive: true }, relations: RELATIONS });
  }
}
