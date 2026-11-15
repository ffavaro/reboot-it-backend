import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EstadoProcesoDestruccion } from './estado-proceso-destruccion.entity';
import { CreateEstadoProcesoDestruccionDto } from './dto/create-estado-proceso-destruccion.dto';
import { UpdateEstadoProcesoDestruccionDto } from './dto/update-estado-proceso-destruccion.dto';
import { CrudService } from '@app/common/crud/crud-service';

@Injectable()
export class EstadoProcesoDestruccionService extends CrudService<EstadoProcesoDestruccion, CreateEstadoProcesoDestruccionDto, UpdateEstadoProcesoDestruccionDto> {
  constructor(
    @InjectRepository(EstadoProcesoDestruccion) repo: Repository<EstadoProcesoDestruccion>,
  ) {
    super(repo, { etiqueta: 'EstadoProcesoDestruccion', genero: 'f'})
  }

}
