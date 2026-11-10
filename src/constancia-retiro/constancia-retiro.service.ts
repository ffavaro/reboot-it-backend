import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { ConstanciaRetiro } from './constancia-retiro.entity';
import { Retiro } from '../retiro/retiro.entity';
import { CreateConstanciaRetiroDto } from './dto/create-constancia-retiro.dto';
import { UpdateConstanciaRetiroDto } from './dto/update-constancia-retiro.dto';
import { Turno } from '../turno/turno.entity';
import { TurnoDetalle } from '../turno-detalle/turno-detalle.entity';
import { DonacionDetalle } from '../donacion-detalle/donacion-detalle.entity';
import { Usuario } from '../usuarios/usuario.entity';

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

  findAll(alcance: FindOptionsWhere<ConstanciaRetiro> = {}) {
    return this.constanciaRetiroRepository.find({
      where: { isActive: true, ...alcance },
      relations: ['retiro', 'tecnico'],
      order: {id: "DESC"}
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

  async datosDocumento(id: number) {
    const constancia = await this.findOne(id);
    const manager = this.constanciaRetiroRepository.manager;

    const retiro = await manager.findOne(Retiro, {
      where: { id: constancia.retiroId },
      relations: [
        'donacion',
        'donacion.donante',
        'empleadoTransportista',
        'empleadoTransportista.empleado',
        'vehiculo',
      ],
    });
    if (!retiro) throw new NotFoundException('El retiro de la constancia no existe');

    const turno = await manager.findOne(Turno, {
      where: { donacionId: retiro.donacionId, isActive: true },
      order: { id: 'DESC' },
    });

    const detallesTurno = turno
      ? await manager.find(TurnoDetalle, {
          where: { turnoId: turno.id, isActive: true },
          relations: ['tipoMaterial'],
        })
      : [];
    const materiales = detallesTurno.length
      ? detallesTurno.map((d) => ({
          tipo: d.tipoMaterial?.nombre ?? '—',
          cantidad: d.cantidadConfirmada,
        }))
      : (
          await manager.find(DonacionDetalle, {
            where: { donacionId: retiro.donacionId, isActive: true },
            relations: ['tipoMaterial'],
          })
        ).map((d) => ({
          tipo: d.tipoMaterial?.nombre ?? '—',
          cantidad: d.cantidadEstimada,
        }));

    const empleado = retiro.empleadoTransportista?.empleado;
    const usuario = empleado
      ? await manager.findOne(Usuario, { where: { empleadoId: empleado.id } })
      : null;
    const peso = retiro.donacion?.pesoEstimadoKg;

    return {
      constanciaId: constancia.id,
      turnoId: turno?.id ?? null,
      donacionId: retiro.donacionId,
      fechaEmision: constancia.fechaEmision
        ? String(constancia.fechaEmision).slice(0, 10)
        : null,
      fechaRetiro: retiro.fechaRetiro
        ? new Date(retiro.fechaRetiro).toISOString()
        : null,
      observaciones: constancia.observaciones ?? null,
      donante: {
        nombre:
          retiro.donacion?.donante?.razonSocial ||
          retiro.donacion?.donante?.nombre ||
          '',
        telefono: retiro.donacion?.donante?.telefono ?? null,
      },
      direccion:
        retiro.direccion ||
        retiro.donacion?.direccionRetiro ||
        retiro.donacion?.donante?.direccion ||
        null,
      transportista: empleado
        ? {
            nombre: empleado.nombre,
            apellido: empleado.apellido,
            cuitDni: usuario?.cuitDni ?? null,
          }
        : null,
      vehiculo: retiro.vehiculo
        ? {
            patente: retiro.vehiculo.patente,
            marca: retiro.vehiculo.marca,
            modelo: retiro.vehiculo.modelo,
          }
        : null,
      pesoEstimadoKg: peso ?? null,
      materiales,
    };
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
