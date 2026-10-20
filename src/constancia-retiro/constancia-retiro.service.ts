import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConstanciaRetiro } from './constancia-retiro.entity';
import { Turno } from '../turno/turno.entity';
import { Retiro } from '../retiro/retiro.entity';
import { CreateConstanciaRetiroDto } from './dto/create-constancia-retiro.dto';
import { UpdateConstanciaRetiroDto } from './dto/update-constancia-retiro.dto';

@Injectable()
export class ConstanciaRetiroService {
  constructor(
    @InjectRepository(ConstanciaRetiro)
    private readonly constanciaRetiroRepository: Repository<ConstanciaRetiro>,
    @InjectRepository(Retiro)
    private readonly retiroRepository: Repository<Retiro>,
  ) {}

  async create(dto: CreateConstanciaRetiroDto) {
    const constanciaRetiro = this.constanciaRetiroRepository.create(dto);
    const saved = await this.constanciaRetiroRepository.save(constanciaRetiro);
    await this.retiroRepository.update(dto.retiroId, {
      fechaRetiro: new Date(dto.fechaEmision ?? new Date()),
    });
    return saved;
  }

  /** Datos de la constancia armados para mostrarla y descargarla en PDF (donante, retiro, transportista, vehículo y materiales). */
  async datosParaPdf(id: number) {
    const constancia = await this.findOne(id);
    const manager = this.constanciaRetiroRepository.manager;
    const retiro = await manager.getRepository(Retiro).findOne({
      where: { id: constancia.retiroId },
      relations: ['donacion', 'donacion.donante', 'vehiculo', 'empleadoTransportista', 'empleadoTransportista.empleado'],
    });
    if (!retiro) throw new NotFoundException(`Retiro ${constancia.retiroId} no encontrado`);
    const turno = await manager.getRepository(Turno).findOne({
      where: { donacionId: retiro.donacionId, isActive: true },
      relations: ['donante', 'detalles', 'detalles.tipoMaterial'],
      order: { id: 'DESC' },
    });
    const donante = turno?.donante ?? retiro.donacion?.donante;
    const emp = retiro.empleadoTransportista?.empleado;
    return {
      constanciaId: constancia.id,
      turnoId: turno?.id ?? null,
      donacionId: retiro.donacionId,
      fechaEmision: constancia.fechaEmision,
      fechaRetiro: retiro.fechaRetiro,
      observaciones: constancia.observaciones ?? null,
      donante: { nombre: donante?.nombre ?? '', telefono: donante?.telefono ?? null },
      direccion: retiro.direccion ?? retiro.donacion?.direccionRetiro ?? donante?.direccion ?? null,
      transportista: emp ? { nombre: emp.nombre, apellido: emp.apellido, cuitDni: emp.cuitDni ?? null } : null,
      vehiculo: retiro.vehiculo ? { patente: retiro.vehiculo.patente, marca: retiro.vehiculo.marca, modelo: retiro.vehiculo.modelo } : null,
      pesoEstimadoKg: retiro.donacion?.pesoEstimadoKg ?? null,
      materiales: (turno?.detalles ?? []).filter((d) => d.isActive).map((d) => ({ tipo: d.tipoMaterial?.nombre ?? `Material #${d.tipoMaterialId}`, cantidad: d.cantidadConfirmada ?? null })),
    };
  }

  findAll() {
    return this.constanciaRetiroRepository.find({
      where: { isActive: true },
      relations: ['retiro', 'tecnico'],
    });
  }

  async findOne(id: number) {
    const constanciaRetiro = await this.constanciaRetiroRepository.findOne({
      where: { id },
      relations: ['retiro', 'tecnico'],
    });
    if (!constanciaRetiro) throw new NotFoundException(`ConstanciaRetiro ${id} no encontrada`);
    return constanciaRetiro;
  }

  async update(id: number, dto: UpdateConstanciaRetiroDto) {
    const existing = await this.findOne(id);
    await this.constanciaRetiroRepository.update(id, dto);
    if (dto.fechaEmision !== undefined) {
      await this.retiroRepository.update(existing.retiroId, {
        fechaRetiro: new Date(dto.fechaEmision),
      });
    }
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.constanciaRetiroRepository.update(id, { isActive: false });
    return { message: 'ConstanciaRetiro desactivada' };
  }
}
