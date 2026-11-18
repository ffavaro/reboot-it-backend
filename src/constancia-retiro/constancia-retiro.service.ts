import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CrudService } from '@app/common/crud/crud-service';
import { ConstanciaRetiro } from './constancia-retiro.entity';
import { Retiro } from '../retiro/retiro.entity';
import { CreateConstanciaRetiroDto } from './dto/create-constancia-retiro.dto';
import { UpdateConstanciaRetiroDto } from './dto/update-constancia-retiro.dto';
import { Turno } from '../turno/turno.entity';
import { TurnoDetalle } from '../turno-detalle/turno-detalle.entity';
import { DonacionDetalle } from '../donacion-detalle/donacion-detalle.entity';
import { Usuario } from '../usuarios/usuario.entity';

@Injectable()
export class ConstanciaRetiroService extends CrudService<ConstanciaRetiro, CreateConstanciaRetiroDto, UpdateConstanciaRetiroDto> {
  constructor(@InjectRepository(ConstanciaRetiro) repo: Repository<ConstanciaRetiro>) {
    super(repo, { etiqueta: 'ConstanciaRetiro', genero: 'f', relations: ['retiro', 'tecnico'], order: { id: 'DESC' } });
  }

  async create(dto: CreateConstanciaRetiroDto) {
    const saved = await super.create(dto);
    await this.repo.manager.update(Retiro, dto.retiroId, { fechaRetiro: new Date(dto.fechaEmision ?? new Date()) });
    return saved;
  }

  async update(id: number, dto: UpdateConstanciaRetiroDto) {
    const existing = await this.findOne(id);
    await this.repo.update(id, dto);
    if (dto.fechaEmision !== undefined) {
      await this.repo.manager.update(Retiro, existing.retiroId, { fechaRetiro: new Date(dto.fechaEmision) });
    }
    return this.findOne(id);
  }

  async datosDocumento(id: number) {
    const constancia = await this.findOne(id);
    const manager = this.repo.manager;

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
}
