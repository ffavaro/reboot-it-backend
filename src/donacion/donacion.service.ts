import { BadRequestException, ConflictException, HttpException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
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
import { RegistroFotografico } from '../registro-fotografico/registro-fotografico.entity';
import { ESTADO_DONACION } from '../common/constants/estados';
import { EstadoDonacion } from '../estado-donacion/estado-donacion.entity';
import { ConstanciaRetiro } from '../constancia-retiro/constancia-retiro.entity';
import { Lote } from '../lote/lote.entity';
import { CertificadoDisposicion } from '../certificado-disposicion/certificado-disposicion.entity';
import { NotificacionDonacionService } from '../notificaciones/notificacion-donacion.service';

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
    private readonly notificaciones: NotificacionDonacionService,
  ) {}

  // La relación "detalles" trae también los materiales dados de baja: se descartan para no mostrarlos ni duplicarlos
  private soloDetallesActivos<T extends { detalles?: { isActive: boolean }[] }>(donacion: T): T {
    if (donacion.detalles) donacion.detalles = donacion.detalles.filter((d) => d.isActive);
    return donacion;
  }

  async create(dto: CreateDonacionDto) {
    const { fechaHora, detalles, fotosUrls, ...donacionData } = dto;

    // El turno no puede ser de un día ya pasado (hora de Argentina, UTC-3); el horario del día lo valida el frontend
    const ahoraAR = new Date(Date.now() - 3 * 3600 * 1000);
    const inicioHoyAR = Date.UTC(ahoraAR.getUTCFullYear(), ahoraAR.getUTCMonth(), ahoraAR.getUTCDate()) + 3 * 3600 * 1000;
    if (new Date(fechaHora).getTime() < inicioHoyAR) {
      throw new BadRequestException('La fecha del turno no puede ser anterior a hoy.');
    }

    // Toda donación nueva arranca "Pendiente" (quien dona no elige el estado y el equipo tampoco lo deja vacío)
    if (donacionData.estadoDonacionId == null) {
      const pendiente = await this.donacionRepository.manager
        .getRepository(EstadoDonacion)
        .findOne({ where: { descripcion: ESTADO_DONACION.PENDIENTE, isActive: true } });
      if (!pendiente) throw new InternalServerErrorException(`Falta el estado "${ESTADO_DONACION.PENDIENTE}" en los estados de donación.`);
      donacionData.estadoDonacionId = pendiente.id;
    }

    const donacion = this.donacionRepository.create(donacionData);
    const saved = await this.donacionRepository.save(donacion).catch((error:any) => {
      console.log('Error al guardar donación', { error });
      throw new InternalServerErrorException('No se pudo registrar la donación. Intentá nuevamente.');
    });

    const lote = await this.loteService.create({ donacionId: saved.id }).catch(() => {
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
            cantidadConfirmada: detalle.cantidadEstimada ?? undefined,
          }),
        ),
      ).catch((err) => {
        if (err instanceof HttpException) throw err;
        throw new InternalServerErrorException('Error al vincular los materiales con el turno.');
      });
    }

    // Fotos opcionales de los materiales: quedan asociadas al lote y al turno (el retiro de la donación)
    if (fotosUrls?.length) {
      const fotos = this.donacionRepository.manager.getRepository(RegistroFotografico);
      await fotos
        .save(fotosUrls.map((urlImagen) => fotos.create({ loteId: lote.id, turnoId: turno.id, urlImagen })))
        .catch(() => {
          throw new InternalServerErrorException('La donación se creó, pero no se pudieron guardar las fotos.');
        });
    }

    // Se devuelven los datos del turno generado para que el frontend confirme el horario al donante
    return { ...(await this.findOne(saved.id)), turno: { id: turno.id, fechaHora: turno.fechaHora }, loteId: lote.id };
  }

  async findAll() {
    const donaciones = await this.donacionRepository.find({
      where: { isActive: true },
      relations: ['donante', 'estadoDonacion', 'detalles', 'detalles.tipoMaterial', 'detalles.condicionMaterial'],
    });
    return donaciones.map((d) => this.soloDetallesActivos(d));
  }

  async findOne(id: number) {
    const donacion = await this.donacionRepository.findOne({
      where: { id },
      relations: ['donante', 'estadoDonacion', 'detalles', 'detalles.tipoMaterial', 'detalles.condicionMaterial'],
    });
    if (!donacion) throw new NotFoundException(`Donacion ${id} no encontrada`);
    return this.soloDetallesActivos(donacion);
  }

  /**
   * Trazabilidad de una donación en una sola respuesta: datos, materiales, turno, fotos, retiro con su constancia, lote y
   * certificado de disposición. Es lo que muestra el detalle de la donación.
   */
  async detalle(id: number) {
    const donacion = await this.findOne(id);
    const manager = this.donacionRepository.manager;
    const turno = await this.turnoRepository.findOne({
      where: { donacionId: id, isActive: true },
      relations: ['estadoTurno', 'empleado', 'empleadoTransportista', 'empleadoTransportista.empleado'],
      order: { createdAt: 'DESC' },
    });
    const retiro = await this.retiroRepository.findOne({ where: { donacionId: id, isActive: true } });
    const constancia = retiro
      ? await manager.getRepository(ConstanciaRetiro).findOne({ where: { retiroId: retiro.id, isActive: true } })
      : null;
    const lote = await manager.getRepository(Lote).findOne({ where: { donacionId: id, isActive: true } });
    const certificado = lote
      ? await manager.getRepository(CertificadoDisposicion).findOne({ where: { loteId: lote.id, isActive: true }, relations: ['gestorAmbiental'] })
      : null;
    const condiciones = [turno ? { turnoId: turno.id, isActive: true } : null, lote ? { loteId: lote.id, isActive: true } : null].filter(
      (c): c is { turnoId: number; isActive: boolean } | { loteId: number; isActive: boolean } => c !== null,
    );
    const fotos = condiciones.length
      ? await manager.getRepository(RegistroFotografico).find({ where: condiciones, order: { fecha: 'ASC', id: 'ASC' } })
      : [];
    const persona = (e?: { id: number; nombre: string; apellido: string } | null) => (e ? { id: e.id, nombre: e.nombre, apellido: e.apellido } : null);

    return {
      id: donacion.id,
      descripcion: donacion.descripcion,
      createdAt: donacion.createdAt,
      necesitaRetiro: donacion.necesitaRetiro,
      // la de la donación o, si no cargó otra, la del retiro o la del donante
      direccionRetiro: donacion.direccionRetiro || retiro?.direccion || donacion.donante?.direccion || null,
      pesoEstimadoKg: donacion.pesoEstimadoKg,
      estado: donacion.estadoDonacion?.descripcion ?? null,
      donante: { id: donacion.donanteId, nombre: donacion.donante?.nombre ?? null, razonSocial: donacion.donante?.razonSocial ?? null },
      materiales: (donacion.detalles ?? []).map((d) => ({
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
            empleado: persona(turno.empleado),
            transportista: persona(turno.empleadoTransportista?.empleado),
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
      fotos: fotos.map((f) => ({ id: f.id, url: f.urlImagen, fecha: f.fecha })),
    };
  }

  async update(id: number, dto: UpdateDonacionDto) {
    const actual = await this.findOne(id);
    const { detalles, ...donacionData } = dto;
    if (Object.keys(donacionData).length) {
      await this.donacionRepository.update(id, donacionData);
      // si cambió el estado, se le avisa al donante por email
      if (donacionData.estadoDonacionId !== undefined) void this.notificaciones.estadoCambiado(id, actual.estadoDonacionId);
    }

    if (detalles !== undefined) {
      const existing = await this.donacionDetalleService.findByDonacion(id);
      // Primero se crean los nuevos: si alguno falla, la donación conserva sus materiales
      const nuevos = await Promise.all(
        detalles.map((d) => this.donacionDetalleService.create({ ...d, donacionId: id })),
      ).catch((err) => {
        if (err instanceof HttpException) throw err;
        throw new BadRequestException('No se pudieron guardar los materiales. Revisá el tipo, la condición y la cantidad de cada uno.');
      });
      await Promise.all(existing.map((d) => this.donacionDetalleService.remove(d.id)));
      await this.sincronizarDetallesTurno(id, nuevos);
    }

    return this.findOne(id);
  }

  // Mientras el turno siga en su estado inicial, sus materiales acompañan los cambios de la donación
  private async sincronizarDetallesTurno(donacionId: number, nuevos: { id: number; tipoMaterialId: number; cantidadEstimada: number | null }[]) {
    const turno = await this.turnoRepository.findOne({ where: { donacionId, isActive: true } });
    if (!turno || turno.estadoTurnoId !== 1) return;
    const anteriores = await this.turnoDetalleService.findByTurno(turno.id);
    await Promise.all(anteriores.map((t) => this.turnoDetalleService.remove(t.id)));
    await Promise.all(
      nuevos.map((detalle) =>
        this.turnoDetalleService.create({
          turnoId: turno.id,
          donacionDetalleId: detalle.id,
          tipoMaterialId: detalle.tipoMaterialId,
          cantidadConfirmada: detalle.cantidadEstimada ?? undefined,
        }),
      ),
    );
  }

  /**
   * Regla L del Donante: modifica o cancela su donación solo mientras sigue pendiente. Desde que entra en proceso
   * (o termina, o se cancela) ya no se toca.
   */
  async validarCambioDelDonante(id: number) {
    const donacion = await this.findOne(id);
    const estado = donacion.estadoDonacion?.descripcion;
    if (estado && estado !== ESTADO_DONACION.PENDIENTE) {
      throw new ConflictException(`La donación está "${estado}": solo se puede modificar o cancelar mientras está pendiente.`);
    }
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
}
