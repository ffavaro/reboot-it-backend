import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CrudService } from '@app/common/crud/crud-service';
import { Modelo } from './modelo.entity';
import { CreateModeloDto } from './dto/create-modelo.dto';
import { UpdateModeloDto } from './dto/update-modelo.dto';

@Injectable()
export class ModeloService extends CrudService<Modelo, CreateModeloDto, UpdateModeloDto> {
  constructor(@InjectRepository(Modelo) repo: Repository<Modelo>) {
    super(repo, { etiqueta: 'Modelo', genero: 'm', relations: ['marca', 'tipo'] });
  }

  findByMarca(marcaId: number) {
    return this.repo.find({ where: { marcaId, isActive: true }, relations: ['marca', 'tipo'] });
  }

  findByTipo(tipoId: number) {
    return this.repo.find({ where: { tipoId, isActive: true }, relations: ['marca', 'tipo'] });
  }
}
