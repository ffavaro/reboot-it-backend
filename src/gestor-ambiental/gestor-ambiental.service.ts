import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GestorAmbiental } from './gestor-ambiental.entity';
import { CreateGestorAmbientalDto } from './dto/create-gestor-ambiental.dto';
import { UpdateGestorAmbientalDto } from './dto/update-gestor-ambiental.dto';
import { CrudService } from '@app/common/crud/crud-service';

@Injectable()
export class GestorAmbientalService  extends CrudService<GestorAmbiental, CreateGestorAmbientalDto, UpdateGestorAmbientalDto> {
  constructor(
    @InjectRepository(GestorAmbiental) repo: Repository<GestorAmbiental>,
  ) {
      super(repo, { etiqueta: 'Gestor Ambiental', genero: 'f'})
  }
}
