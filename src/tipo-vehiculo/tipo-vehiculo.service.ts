import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
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

  private validarRango(min?: number | null, max?: number | null) {
    if (min != null && max != null && Number(min) > Number(max)) {
      throw new BadRequestException('El peso mínimo no puede ser mayor al peso máximo');
    }
  }

  create(dto: CreateTipoVehiculoDto) {
    this.validarRango(dto.pesoMinimo, dto.pesoMaximo);
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
    const actual = await this.findOne(id);
    this.validarRango(dto.pesoMinimo ?? actual.pesoMinimo, dto.pesoMaximo ?? actual.pesoMaximo);
    await this.tipoVehiculoRepository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.tipoVehiculoRepository.update(id, { isActive: false });
    return { message: 'TipoVehiculo desactivado' };
  }
}
