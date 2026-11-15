import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MetodoDestruccion } from './metodo-destruccion.entity';
import { CreateMetodoDestruccionDto } from './dto/create-metodo-destruccion.dto';
import { UpdateMetodoDestruccionDto } from './dto/update-metodo-destruccion.dto';
import { CrudService } from '@app/common/crud/crud-service';

@Injectable()
export class MetodoDestruccionService  extends CrudService<MetodoDestruccion, CreateMetodoDestruccionDto, UpdateMetodoDestruccionDto> {
  constructor(
    @InjectRepository(MetodoDestruccion) repo: Repository<MetodoDestruccion>,
  ) {
    super(repo, { etiqueta: 'MetodoDestruccion', genero: 'f'})
  }
}
