import { BadRequestException, HttpException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Donacion } from './donacion.entity';
import { CreateDonacionDto } from './dto/create-donacion.dto';
import { UpdateDonacionDto } from './dto/update-donacion.dto';
import { ReporteDonacionDto } from './dto/reporte-donacion.dto';
import { TurnoService } from '../turno/turno.service';
import { DonacionDetalleService } from '../donacion-detalle/donacion-detalle.service';
import { TurnoDetalleService } from '../turno-detalle/turno-detalle.service';
import { LoteService } from '../lote/lote.service';
import { Turno } from '../turno/turno.entity';
import { Retiro } from '../retiro/retiro.entity';

@Injectable()
export class DonacionService {
  constructor(
    @InjectRepository(Donacion)
    private readonly donacionRepository: Repository<Donacion>,
    @InjectRepository(Turno)
    private readonly turnoRepository: Repository<Turno>,
    @InjectRepository(Retiro)
    private readonly retiroRepository: Repository<Retiro>,
    private readonly turnoService: TurnoService,
    private readonly donacionDetalleService: DonacionDetalleService,
    private readonly turnoDetalleService: TurnoDetalleService,
    private readonly loteService: LoteService,
  ) {}

  async create(dto: CreateDonacionDto) {
    const { fechaHora, detalles, ...donacionData } = dto;

    const donacion = this.donacionRepository.create(donacionData);
    const saved = await this.donacionRepository.save(donacion).catch((error:any) => {
      console.log('Error al guardar donación', { error });
      throw new InternalServerErrorException('No se pudo registrar la donación. Intentá nuevamente.');
    });

    await this.loteService.create({ donacionId: saved.id }).catch(() => {
      throw new InternalServerErrorException('No se pudo crear el lote para la donación.');
    });

    const savedDetalles = detalles?.length
      ? await Promise.all(
          detalles.map((d) =>
            this.donacionDetalleService.create({ ...d, donacionId: saved.id }),
          ),
        ).catch((err) => {
          if (err instanceof HttpException) throw err;
          throw new BadRequestException('Error al guardar los materiales de la donación.');
        })
      : [];

    const turno = await this.turnoService
      .create({
        donanteId: dto.donanteId,
        donacionId: saved.id,
        estadoTurnoId: 1,
        fechaHora: fechaHora as unknown as Date,
        descripcion: dto.descripcion,
        necesitaRetiro: dto.necesitaRetiro ?? false,
      })
      .catch((err) => {
        if (err instanceof HttpException) throw err;
        throw new BadRequestException('No se pudo crear el turno para el horario seleccionado.');
      });

    if (savedDetalles.length) {
      await Promise.all(
        savedDetalles.map((detalle) =>
          this.turnoDetalleService.create({
            turnoId: turno.id,
            donacionDetalleId: detalle.id,
            tipoMaterialId: detalle.tipoMaterialId,
            descripcion: detalle.descripcion ?? undefined,
            cantidadConfirmada: detalle.cantidadEstimada ?? undefined,
            observaciones: detalle.observaciones ?? undefined,
          }),
        ),
      ).catch((err) => {
        if (err instanceof HttpException) throw err;
        throw new InternalServerErrorException('Error al vincular los materiales con el turno.');
      });
    }

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

  async reporte(query: ReporteDonacionDto) {
    const qb = this.donacionRepository
      .createQueryBuilder('d')
      .leftJoinAndSelect('d.donante', 'donante')
      .leftJoinAndSelect('d.estadoDonacion', 'estadoDonacion')
      .leftJoinAndSelect('d.detalles', 'detalles')
      .leftJoinAndSelect('detalles.tipoMaterial', 'tipoMaterial')
      .where('d.isActive = :active', { active: true });

    if (query.donanteId) {
      qb.andWhere('d.donanteId = :donanteId', { donanteId: query.donanteId });
    }
    if (query.estadoDonacionId !== undefined) {
      qb.andWhere('d.estadoDonacionId = :estadoDonacionId', { estadoDonacionId: query.estadoDonacionId });
    }
    if (query.necesitaRetiro !== undefined) {
      qb.andWhere('d.necesitaRetiro = :necesitaRetiro', { necesitaRetiro: query.necesitaRetiro });
    }
    if (query.fechaDesde) {
      qb.andWhere('d.createdAt >= :fechaDesde', { fechaDesde: query.fechaDesde });
    }
    if (query.fechaHasta) {
      qb.andWhere('d.createdAt <= :fechaHasta', { fechaHasta: `${query.fechaHasta}T23:59:59` });
    }

    let donaciones = await qb.getMany();

    if (query.tieneMateriales === true) {
      donaciones = donaciones.filter((d) => d.detalles?.length > 0);
    } else if (query.tieneMateriales === false) {
      donaciones = donaciones.filter((d) => !d.detalles?.length);
    }

    if (!donaciones.length) return [];

    const ids = donaciones.map((d) => d.id);

    const [turnos, retiros] = await Promise.all([
      this.turnoRepository.find({
        where: { donacionId: In(ids), isActive: true },
        relations: ['estadoTurno'],
      }),
      this.retiroRepository.find({
        where: { donacionId: In(ids), isActive: true },
        relations: ['empleadoTransportista', 'empleadoTransportista.empleado', 'vehiculo'],
      }),
    ]);

    const turnosByDonacion = new Map(turnos.map((t) => [t.donacionId, t]));
    const retirosByDonacion = new Map(retiros.map((r) => [r.donacionId, r]));

    return donaciones.map((d) => ({
      ...d,
      turno: turnosByDonacion.get(d.id) ?? null,
      retiro: retirosByDonacion.get(d.id) ?? null,
    }));
  }
}
