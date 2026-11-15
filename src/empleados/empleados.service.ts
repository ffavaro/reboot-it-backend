import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CrudService } from '@app/common/crud/crud-service';
import { Empleado } from './empleado.entity';
import { CreateEmpleadoDto } from './dto/create-empleado.dto';
import { UpdateEmpleadoDto } from './dto/update-empleado.dto';

@Injectable()
export class EmpleadosService extends CrudService<Empleado, CreateEmpleadoDto, UpdateEmpleadoDto> {
  constructor(@InjectRepository(Empleado) repo: Repository<Empleado>) {
    super(repo, { etiqueta: 'Empleado', genero: 'm', relations: ['rol'], order: { id: 'DESC' } });
  }
}
