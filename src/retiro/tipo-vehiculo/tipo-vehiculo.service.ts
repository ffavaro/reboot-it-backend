import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TipoVehiculo } from './tipo-vehiculo.entity';
import { CreateTipoVehiculoDto } from './dto/create-tipo-vehiculo.dto';
import { UpdateTipoVehiculoDto } from './dto/update-tipo-vehiculo.dto';

@Injectable()
export class TipoVehiculoService {
  constructor(
    @InjectRepository(TipoVehiculo)
    private readonly tipoVehiculoRepository: Repository<TipoVehiculo>,
  ) {}

  create(dto: CreateTipoVehiculoDto) {
    const tipo = this.tipoVehiculoRepository.create(dto);
    return this.tipoVehiculoRepository.save(tipo);
  }

  findAll() {
    return this.tipoVehiculoRepository.find({ where: { isActive: true } });
  }

  async findOne(id: number) {
    const tipo = await this.tipoVehiculoRepository.findOne({ where: { id } });
    if (!tipo) throw new NotFoundException(`TipoVehiculo ${id} no encontrado`);
    return tipo;
  }

  async update(id: number, dto: UpdateTipoVehiculoDto) {
    await this.findOne(id);
    await this.tipoVehiculoRepository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.tipoVehiculoRepository.update(id, { isActive: false });
    return { message: 'TipoVehiculo desactivado' };
  }
}
