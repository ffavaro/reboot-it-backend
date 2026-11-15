import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tipo } from './tipo.entity';
import { CreateTipoDto } from './dto/create-tipo.dto';
import { UpdateTipoDto } from './dto/update-tipo.dto';
import { CrudService } from '@app/common/crud/crud-service';

@Injectable()
export class TipoService extends CrudService<Tipo, CreateTipoDto, UpdateTipoDto> {
    constructor(
      @InjectRepository(Tipo) repo: Repository<Tipo>
    ) {
      super(repo, { etiqueta: 'Tipo', genero: 'f'})
    }
}
