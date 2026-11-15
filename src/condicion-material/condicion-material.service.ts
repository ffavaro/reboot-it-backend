import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CondicionMaterial } from './condicion-material.entity';
import { CreateCondicionMaterialDto } from './dto/create-condicion-material.dto';
import { UpdateCondicionMaterialDto } from './dto/update-condicion-material.dto';
import { CrudService } from '@app/common/crud/crud-service';

@Injectable()
export class CondicionMaterialService extends CrudService<CondicionMaterial, CreateCondicionMaterialDto, UpdateCondicionMaterialDto> {
    constructor(
        @InjectRepository(CondicionMaterial) repo: Repository<CondicionMaterial>
      ) {
        super(repo, { etiqueta: 'CondicionMaterial', genero: 'f'})
      }
}
