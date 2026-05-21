import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Modelo } from './modelo.entity';
import { CreateModeloDto } from './dto/create-modelo.dto';
import { UpdateModeloDto } from './dto/update-modelo.dto';

@Injectable()
export class ModeloService {
  constructor(
    @InjectRepository(Modelo)
    private readonly modeloRepository: Repository<Modelo>,
  ) {}

  create(dto: CreateModeloDto) {
    const modelo = this.modeloRepository.create(dto);
    return this.modeloRepository.save(modelo);
  }

  findAll() {
    return this.modeloRepository.find({
      where: { isActive: true },
      relations: ['marca', 'tipo'],
    });
  }

  findByMarca(marcaId: number) {
    return this.modeloRepository.find({
      where: { marcaId, isActive: true },
      relations: ['marca', 'tipo'],
    });
  }

  findByTipo(tipoId: number) {
    return this.modeloRepository.find({
      where: { tipoId, isActive: true },
      relations: ['marca', 'tipo'],
    });
  }

  async findOne(id: number) {
    const modelo = await this.modeloRepository.findOne({
      where: { id },
      relations: ['marca', 'tipo'],
    });
    if (!modelo) throw new NotFoundException(`Modelo ${id} no encontrado`);
    return modelo;
  }

  async update(id: number, dto: UpdateModeloDto) {
    await this.findOne(id);
    await this.modeloRepository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.modeloRepository.update(id, { isActive: false });
    return { message: 'Modelo desactivado' };
  }
}
