import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RegistroFotografico } from './registro-fotografico.entity';
import { CreateRegistroFotograficoDto } from './dto/create-registro-fotografico.dto';
import { UpdateRegistroFotograficoDto } from './dto/update-registro-fotografico.dto';
import { CrudService } from '@app/common/crud/crud-service';
@Injectable()
export class RegistroFotograficoService extends CrudService<
  RegistroFotografico, CreateRegistroFotograficoDto, UpdateRegistroFotograficoDto
> {
  constructor(@InjectRepository(RegistroFotografico) repo: Repository<RegistroFotografico>) {
    super(repo, { etiqueta: 'RegistroFotografico', relations: ['lote', 'turno'], genero:'m' });
  }

  findByTurno(turnoId: number) {
    return this.repo.find({ where: { turnoId, isActive: true }, relations: ['turno'] });
  }
}
