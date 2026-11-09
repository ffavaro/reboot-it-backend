import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { And, DataSource, Equal, FindOperator, FindOptionsWhere, ObjectLiteral, Raw } from 'typeorm';
import type { EntityTarget } from 'typeorm';
import { CertificadoDisposicion } from '../certificado-disposicion/certificado-disposicion.entity';
import { ConstanciaRetiro } from '../constancia-retiro/constancia-retiro.entity';
import { Donacion } from '../donacion/donacion.entity';
import { Donante } from '../donantes/donante.entity';
import { EmpleadoTransportista } from '../empleado-transportista/empleado-transportista.entity';
import { Empleado } from '../empleados/empleado.entity';
import { HistorialKmVehiculo } from '../historial-km-vehiculo/entities/historial-km-vehiculo.entity';
import type { RequestConUsuario } from '../interfaces/auth.type';
import { Lote } from '../lote/lote.entity';
import { RegistroFotografico } from '../registro-fotografico/registro-fotografico.entity';
import { Retiro } from '../retiro/retiro.entity';
import { Turno } from '../turno/turno.entity';
import { Usuario } from '../usuarios/usuario.entity';
import { Vehiculo } from '../vehiculos/vehiculo.entity';
import { ESTADO_EN_CLASIFICACION } from '../utils/helpers';
import { CONSULTAS_POR_RECURSO } from './alcance.consultas';
import { ocultarDatosDelTransportista } from './ocultar-transportista';
import type { Recurso } from './alcance.consultas';

const ESTADOS_EN_PLANTA = [ESTADO_EN_CLASIFICACION, 'Finalizado'];

const ENTIDAD_POR_RECURSO: Record<Recurso, EntityTarget<ObjectLiteral>> = {
  donantes: Donante,
  donaciones: Donacion,
  turnos: Turno,
  retiros: Retiro,
  lotes: Lote,
  certificados: CertificadoDisposicion,
  constancias: ConstanciaRetiro,
  fotos: RegistroFotografico,
  vehiculos: Vehiculo,
  historialKm: HistorialKmVehiculo,
  transportistas: EmpleadoTransportista,
  empleados: Empleado,
  usuarios: Usuario,
};

@Injectable()
export class AlcanceService {
  private readonly donantePorRequest = new WeakMap<object, Promise<boolean>>();

  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  esTotal(req: RequestConUsuario): boolean {
    return (req.acceso?.alcance ?? 'TODOS') === 'TODOS';
  }

  esPropio(req: RequestConUsuario): boolean {
    return req.acceso?.alcance === 'PROPIOS';
  }

  condicion<T extends { id: number }>(req: RequestConUsuario, recurso: Recurso): FindOptionsWhere<T> {
    const filtro = this.filtroDeIds(req, recurso);
    return (filtro ? { id: filtro } : {}) as FindOptionsWhere<T>;
  }

  async exigir(req: RequestConUsuario, recurso: Recurso, id: number | null | undefined): Promise<void> {
    const filtro = this.filtroDeIds(req, recurso);
    if (!filtro) return;
    const visible =
      typeof id === 'number' &&
      (await this.dataSource.getRepository(ENTIDAD_POR_RECURSO[recurso]).exists({ where: { id: And(Equal(id), filtro) } }));
    if (!visible) throw new ForbiddenException('No tenés acceso a este registro.');
  }

  private filtroDeIds(req: RequestConUsuario, recurso: Recurso): FindOperator<number> | null {
    const alcance = req.acceso?.alcance ?? 'TODOS';
    if (alcance === 'TODOS') return null;

    const sql = CONSULTAS_POR_RECURSO[recurso][alcance];
    if (!sql) return alcance === 'EN_PLANTA' ? null : Raw(() => '1 = 0');

    return Raw((columna) => `${columna} IN (${sql})`, {
      alcanceUsuarioId: req.user?.id ?? 0,
      alcanceEmpleadoId: req.user?.empleadoId ?? 0,
      alcanceEstadosPlanta: ESTADOS_EN_PLANTA,
    });
  }

  async transportistaId(req: RequestConUsuario): Promise<number> {
    const ficha = req.user?.empleadoId
      ? await this.dataSource
          .getRepository(EmpleadoTransportista)
          .findOne({ where: { empleadoId: req.user.empleadoId, isActive: true } })
      : null;
    if (!ficha) throw new ForbiddenException('Tu usuario no tiene una ficha de transportista activa.');
    return ficha.id;
  }

  async paraElSolicitante<T>(req: RequestConUsuario, respuesta: T): Promise<T> {
    return (await this.esDonante(req)) ? ocultarDatosDelTransportista(respuesta) : respuesta;
  }

  esDonante(req: RequestConUsuario): Promise<boolean> {
    let respuesta = this.donantePorRequest.get(req);
    if (!respuesta) {
      respuesta = req.user
        ? this.dataSource.getRepository(Donante).exists({ where: { usuarioId: req.user.id, isActive: true } })
        : Promise.resolve(false);
      this.donantePorRequest.set(req, respuesta);
    }
    return respuesta;
  }
}
