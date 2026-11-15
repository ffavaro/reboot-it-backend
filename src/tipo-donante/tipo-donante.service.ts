import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TipoDonante } from './tipo-donante.entity';
import { CreateTipoDonanteDto } from './dto/create-tipo-donante.dto';
import { UpdateTipoDonanteDto } from './dto/update-tipo-donante.dto';
import { CrudService } from '@app/common/crud/crud-service';

@Injectable()
export class TipoDonanteService extends CrudService<TipoDonante, CreateTipoDonanteDto, UpdateTipoDonanteDto>  {
  constructor(
    @InjectRepository(TipoDonante) repo: Repository<TipoDonante>,
  ) {
      super(repo, { etiqueta: 'TipoDonante', genero: 'f'})
    }
}
