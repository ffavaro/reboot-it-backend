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
import { NotificacionDonacionService } from '../notificaciones/notificacion-donacion.service';
import { datosDePersona } from '@app/interfaces/donacion.type';
import { ConstanciaRetiro } from '@app/constancia-retiro/constancia-retiro.entity';
import { CertificadoDisposicion } from '@app/certificado-disposicion/certificado-disposicion.entity';
import { RegistroFotografico } from '@app/registro-fotografico/registro-fotografico.entity';
import { Lote } from '@app/lote/lote.entity';

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
    private readonly notificacionDonacionService: NotificacionDonacionService,
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
        fechaHora: fechaHora as any as Date,
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
            cantidadConfirmada: detalle.cantidadEstimada ?? undefined,
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
      relations: ['donante', 'estadoDonacion', 'detalles', 'detalles.tipoMaterial', 'detalles.condicionMaterial'],
      order: { id : "DESC"}
    });
  }

  async findOne(id: number) {
    const donacion = await this.donacionRepository.findOne({
      where: { id },
      relations: ['donante', 'estadoDonacion', 'detalles', 'detalles.tipoMaterial', 'detalles.condicionMaterial'],
    });
    if (!donacion) throw new NotFoundException(`Donacion ${id} no encontrada`);
    return donacion;
  }

  async update(id: number, dto: UpdateDonacionDto) {
    const actual = await this.findOne(id);
    const { detalles, ...donacionData } = dto;
    if (Object.keys(donacionData).length) {
      await this.donacionRepository.update(id, donacionData);
      if (donacionData.estadoDonacionId !== undefined) {
        void this.notificacionDonacionService.notificarSiCambio(id, actual.estadoDonacionId);
      }
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
      .leftJoinAndSelect('detalles.condicionMaterial', 'condicionMaterial')
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

  async trazabilidad(id: number) {
    const donacion = await this.findOne(id);
    const repo = <T extends object>(entidad: new () => T) => this.donacionRepository.manager.getRepository(entidad);

    const [turno, retiro, lote] = await Promise.all([
      this.turnoRepository.findOne({
        where: { donacionId: id, isActive: true },
        relations: ['estadoTurno', 'empleado', 'empleadoTransportista', 'empleadoTransportista.empleado'],
        order: { createdAt: 'DESC' },
      }),
      this.retiroRepository.findOne({ where: { donacionId: id, isActive: true }, order: { createdAt: 'DESC' } }),
      repo(Lote).findOne({ where: { donacionId: id, isActive: true } }),
    ]);

    const [constancia, certificado, fotos] = await Promise.all([
      retiro ? repo(ConstanciaRetiro).findOne({ where: { retiroId: retiro.id, isActive: true } }) : null,
      lote ? repo(CertificadoDisposicion).findOne({ where: { loteId: lote.id, isActive: true }, relations: ['gestorAmbiental'] }) : null,
      turno || lote
        ? repo(RegistroFotografico).find({
            where: [
              ...(turno ? [{ turnoId: turno.id, isActive: true }] : []),
              ...(lote ? [{ loteId: lote.id, isActive: true }] : []),
            ],
            order: { id: 'ASC' },
          })
        : [],
    ]);

    return {
      id: donacion.id,
      descripcion: donacion.descripcion,
      createdAt: donacion.createdAt,
      necesitaRetiro: donacion.necesitaRetiro,
      direccionRetiro: donacion.direccionRetiro || retiro?.direccion || donacion.donante?.direccion || null,
      pesoEstimadoKg: donacion.pesoEstimadoKg,
      estado: donacion.estadoDonacion?.descripcion ?? null,
      donante: { id: donacion.donanteId, nombre: donacion.donante?.nombre ?? null, razonSocial: donacion.donante?.razonSocial ?? null },
      materiales: (donacion.detalles ?? [])
        .filter((d) => d.isActive !== false)
        .map((d) => ({
          id: d.id,
          tipo: d.tipoMaterial?.nombre ?? null,
          condicion: d.condicionMaterial?.condicion ?? null,
          cantidad: d.cantidadEstimada,
        })),
      turno: turno
        ? {
            id: turno.id,
            fechaHora: turno.fechaHora,
            estado: turno.estadoTurno?.descripcion ?? null,
            empleado: datosDePersona(turno.empleado),
            transportista: datosDePersona(turno.empleadoTransportista?.empleado),
          }
        : null,
      retiro: retiro ? { id: retiro.id, fechaRetiro: retiro.fechaRetiro, direccion: retiro.direccion } : null,
      constancia: constancia ? { id: constancia.id, fechaEmision: constancia.fechaEmision } : null,
      lote: lote ? { id: lote.id, pesoBrutoKg: lote.pesoBrutoKg } : null,
      certificado: certificado
        ? {
            id: certificado.id,
            numero: certificado.numeroCertificado,
            fechaEmision: certificado.fechaEmision,
            gestor: certificado.gestorAmbiental?.razonSocial ?? null,
            archivoFinalUrl: certificado.archivoFinalUrl,
          }
        : null,
      fotos: [...new Map(fotos.map((f) => [f.id, f])).values()].map((f) => ({ id: f.id, url: f.urlImagen, fecha: f.fecha })),
    };
  }

  
}
