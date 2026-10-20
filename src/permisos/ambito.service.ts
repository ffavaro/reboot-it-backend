import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Donante } from '../donantes/donante.entity';
import { EmpleadoTransportista } from '../empleado-transportista/empleado-transportista.entity';
import { Turno } from '../turno/turno.entity';
import { Retiro } from '../retiro/retiro.entity';
import { Donacion } from '../donacion/donacion.entity';
import { Lote } from '../lote/lote.entity';
import type { RequestConUsuario } from '../auth/auth-user';
import { PermisosService } from './permisos.service';

/**
 * Registros a los que puede acceder un usuario que solo ve "lo propio" (Donante) o "lo asignado" (Transportista).
 * Cada conjunto trae los ids permitidos de esa entidad.
 */
export interface Ambito {
  donantes: Set<number>;
  donaciones: Set<number>;
  turnos: Set<number>;
  retiros: Set<number>;
  lotes: Set<number>;
  vehiculos: Set<number>;
  transportistas: Set<number>;
  empleados: Set<number>;
  // Identidad del usuario, para las pantallas que lo necesitan (null si no tiene)
  donanteId: number | null;
  transportistaId: number | null;
}

const vacio = (): Ambito => ({
  donantes: new Set(), donaciones: new Set(), turnos: new Set(), retiros: new Set(), lotes: new Set(),
  vehiculos: new Set(), transportistas: new Set(), empleados: new Set(), donanteId: null, transportistaId: null,
});

const ids = (xs: (number | null | undefined)[]) => xs.filter((x): x is number => typeof x === 'number');

@Injectable()
export class AmbitoService {
  // Un request puede consultar varias veces el ámbito: se resuelve una sola vez
  private readonly porRequest = new WeakMap<object, Promise<Ambito>>();

  constructor(
    private readonly permisos: PermisosService,
    @InjectRepository(Donante) private readonly donanteRepo: Repository<Donante>,
    @InjectRepository(EmpleadoTransportista) private readonly transportistaRepo: Repository<EmpleadoTransportista>,
    @InjectRepository(Turno) private readonly turnoRepo: Repository<Turno>,
    @InjectRepository(Retiro) private readonly retiroRepo: Repository<Retiro>,
    @InjectRepository(Donacion) private readonly donacionRepo: Repository<Donacion>,
    @InjectRepository(Lote) private readonly loteRepo: Repository<Lote>,
  ) {}

  /**
   * Ámbito del usuario para este request, o null si no está restringido.
   * `pantallas` son las claves que habilitan el endpoint (por defecto las del @Pantalla de la ruta).
   * Queda restringido quien, para esas pantallas, solo tiene alcance PROPIO o ASIGNADO; y también el Donante o el
   * Transportista que no tiene alcance pleno ni limitado (por ejemplo en listados que usan como combo).
   */
  async de(req: RequestConUsuario, pantallas?: string[]): Promise<Ambito | null> {
    const user = req.user;
    if (!user) return vacio();
    const claves = pantallas ?? req.permiso?.pantallas ?? [];
    const alcance = await this.permisos.alcance(user.rolId, claves, 'ver');
    if (alcance === 'PLENO' || alcance === 'LIMITADO') return null;

    let promesa = this.porRequest.get(req);
    if (!promesa) {
      promesa = this.resolver(user.id, user.empleadoId ?? null);
      this.porRequest.set(req, promesa);
    }
    const ambito = await promesa;
    // Donante y Transportista siempre son externos, aunque todavía no tengan su ficha de donante o de transportista
    const rolExterno = ['donante', 'transportista'].includes((user.rol?.nombre ?? '').trim().toLowerCase());
    const tieneIdentidad = rolExterno || ambito.donanteId !== null || ambito.transportistaId !== null;
    if (alcance === 'NINGUNO' && !tieneIdentidad) return null; // rol de staff usando un listado como combo
    return ambito;
  }

  private async resolver(usuarioId: number, empleadoId: number | null): Promise<Ambito> {
    const a = vacio();
    const donante = await this.donanteRepo.findOne({ where: { usuarioId, isActive: true } });
    const transportista = empleadoId
      ? await this.transportistaRepo.findOne({ where: { empleadoId, isActive: true } })
      : null;

    let turnos: Turno[] = [];
    let retiros: Retiro[] = [];

    if (donante) {
      a.donanteId = donante.id;
      a.donantes.add(donante.id);
      turnos = await this.turnoRepo.find({ where: { donanteId: donante.id, isActive: true } });
      const donaciones = await this.donacionRepo.find({ where: { donanteId: donante.id, isActive: true } });
      donaciones.forEach((d) => a.donaciones.add(d.id));
      retiros = a.donaciones.size
        ? await this.retiroRepo.find({ where: { donacionId: In([...a.donaciones]), isActive: true } })
        : [];
    } else if (transportista) {
      a.transportistaId = transportista.id;
      a.transportistas.add(transportista.id);
      if (empleadoId) a.empleados.add(empleadoId);
      if (transportista.vehiculoId) a.vehiculos.add(transportista.vehiculoId);
      turnos = await this.turnoRepo.find({ where: { empleadoTransportistaId: transportista.id, isActive: true } });
      retiros = await this.retiroRepo.find({ where: { empleadoTransportistaId: transportista.id, isActive: true } });
      ids([...turnos.map((t) => t.donacionId), ...retiros.map((r) => r.donacionId)]).forEach((id) => a.donaciones.add(id));
      ids(turnos.map((t) => t.donanteId)).forEach((id) => a.donantes.add(id));
      if (a.donaciones.size) {
        const donaciones = await this.donacionRepo.find({ where: { id: In([...a.donaciones]) } });
        donaciones.forEach((d) => a.donantes.add(d.donanteId));
      }
    }

    turnos.forEach((t) => a.turnos.add(t.id));
    retiros.forEach((r) => a.retiros.add(r.id));
    if (donante) ids([...turnos.map((t) => t.empleadoTransportistaId), ...retiros.map((r) => r.empleadoTransportistaId)]).forEach((id) => a.transportistas.add(id));
    if (a.donaciones.size) {
      const lotes = await this.loteRepo.find({ where: { donacionId: In([...a.donaciones]), isActive: true } });
      lotes.forEach((l) => a.lotes.add(l.id));
    }
    return a;
  }

  /** Lanza 403 si el registro no está dentro del ámbito (null = sin restricción). */
  exigir(ambito: Ambito | null, conjunto: keyof Pick<Ambito, 'donantes' | 'donaciones' | 'turnos' | 'retiros' | 'lotes' | 'vehiculos' | 'transportistas' | 'empleados'>, id: number | null | undefined) {
    if (ambito && (typeof id !== 'number' || !ambito[conjunto].has(id))) {
      throw new ForbiddenException('Solo podés operar sobre tus propios registros.');
    }
  }
}
