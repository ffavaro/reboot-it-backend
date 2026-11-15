import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CrudService } from '@app/common/crud/crud-service';
import { Donante } from './donante.entity';
import { CreateDonanteDto } from './dto/create-donante.dto';
import { UpdateDonanteDto } from './dto/update-donante.dto';

@Injectable()
export class DonantesService extends CrudService<Donante, CreateDonanteDto, UpdateDonanteDto> {
  constructor(@InjectRepository(Donante) repo: Repository<Donante>) {
    super(repo, { etiqueta: 'Donante', genero: 'm', relations: ['tipoDonante'], order: { id: 'DESC' } });
  }
}
