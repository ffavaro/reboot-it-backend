import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TipoMaterial } from './tipo-material.entity';
import { CreateTipoMaterialDto } from './dto/create-tipo-material.dto';
import { UpdateTipoMaterialDto } from './dto/update-tipo-material.dto';
import { CrudService } from '@app/common/crud/crud-service';

@Injectable()
export class TipoMaterialService extends CrudService<TipoMaterial, CreateTipoMaterialDto, UpdateTipoMaterialDto> {
  constructor(
    @InjectRepository(TipoMaterial) repo: Repository<TipoMaterial>,
  ) {
     super(repo, { etiqueta: 'TipoMaterial', genero: 'f'})
  }
}
