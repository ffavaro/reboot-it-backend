import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EstadoDonacion } from './estado-donacion.entity';
import { CreateEstadoDonacionDto } from './dto/create-estado-donacion.dto';
import { UpdateEstadoDonacionDto } from './dto/update-estado-donacion.dto';
import { CrudService } from '@app/common/crud/crud-service';

@Injectable()
export class EstadoDonacionService extends CrudService<EstadoDonacion, CreateEstadoDonacionDto, UpdateEstadoDonacionDto> {
  constructor(
    @InjectRepository(EstadoDonacion) repo: Repository<EstadoDonacion>,
  ) {
    super(repo, { etiqueta: "EstadoDonacion", genero: "f"})
  }
}
