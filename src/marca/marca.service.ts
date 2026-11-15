import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Marca } from './marca.entity';
import { CreateMarcaDto } from './dto/create-marca.dto';
import { UpdateMarcaDto } from './dto/update-marca.dto';
import { CrudService } from '@app/common/crud/crud-service';

@Injectable()
export class MarcaService extends CrudService<Marca, CreateMarcaDto, UpdateMarcaDto> {
    constructor(
      @InjectRepository(Marca) repo: Repository<Marca>
    ) {
      super(repo, { etiqueta: 'Marca', genero: 'f'})
    }
}
