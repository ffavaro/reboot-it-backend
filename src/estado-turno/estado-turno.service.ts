import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EstadoTurno } from './estado-turno.entity';
import { CreateEstadoTurnoDto } from './dto/create-estado-turno.dto';
import { UpdateEstadoTurnoDto } from './dto/update-estado-turno.dto';
import { CrudService } from '@app/common/crud/crud-service';

@Injectable()
export class EstadoTurnoService extends CrudService<EstadoTurno, CreateEstadoTurnoDto, UpdateEstadoTurnoDto>{
  constructor(
    @InjectRepository(EstadoTurno) repo: Repository<EstadoTurno>,
  ) {
          super(repo, { etiqueta: 'EstadoTurno', genero: 'f'})
  }
}
