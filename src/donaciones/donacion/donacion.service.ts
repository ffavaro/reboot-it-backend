import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Donacion } from './donacion.entity';
import { CreateDonacionDto } from './dto/create-donacion.dto';
import { UpdateDonacionDto } from './dto/update-donacion.dto';
import { TurnoService } from '../turno/turno.service';
import { DonacionDetalleService } from '../donacion-detalle/donacion-detalle.service';

@Injectable()
export class DonacionService {
  constructor(
    @InjectRepository(Donacion)
    private readonly donacionRepository: Repository<Donacion>,
    private readonly turnoService: TurnoService,
    private readonly donacionDetalleService: DonacionDetalleService,
  ) {}

  async create(dto: CreateDonacionDto) {
    const { fechaHora, detalles, ...donacionData } = dto;
    const donacion = this.donacionRepository.create(donacionData);
    const saved = await this.donacionRepository.save(donacion);

    if (detalles?.length) {
      await Promise.all(
        detalles.map((d) =>
          this.donacionDetalleService.create({ ...d, donacionId: saved.id }),
        ),
      );
    }

    await this.turnoService.create({
      donanteId: dto.donanteId,
      estadoTurnoId: 1,
      fechaHora: fechaHora as unknown as Date,
      descripcion: dto.descripcion,
    });

    return this.findOne(saved.id);
  }

  findAll() {
    return this.donacionRepository.find({
      where: { isActive: true },
      relations: ['donante', 'estadoDonacion', 'detalles', 'detalles.tipoMaterial'],
    });
  }

  async findOne(id: number) {
    const donacion = await this.donacionRepository.findOne({
      where: { id },
      relations: ['donante', 'estadoDonacion', 'detalles', 'detalles.tipoMaterial'],
    });
    if (!donacion) throw new NotFoundException(`Donacion ${id} no encontrada`);
    return donacion;
  }

  async update(id: number, dto: UpdateDonacionDto) {
    await this.findOne(id);
    const { detalles, ...donacionData } = dto;
    if (Object.keys(donacionData).length) {
      await this.donacionRepository.update(id, donacionData);
    }

    if (detalles !== undefined) {
      const existing = await this.donacionDetalleService.findByDonacion(id);
      await Promise.all(existing.map((d) => this.donacionDetalleService.remove(d.id)));
      await Promise.all(
        detalles.map((d) =>
          this.donacionDetalleService.create({ ...d, donacionId: id }),
        ),
      );
    }

    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.donacionRepository.update(id, { isActive: false });
    return { message: 'Donacion desactivada' };
  }
}
