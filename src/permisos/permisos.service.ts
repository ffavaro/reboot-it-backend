import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pantalla } from './pantalla.entity';
import { RolPermiso } from './rol-permiso.entity';
import { Rol } from '../roles/rol.entity';
import { GuardarPermisosDto } from './dto/guardar-permisos.dto';
import { Accion, Alcance, ALCANCES, PermisosPantalla } from './permisos.constants';

const SIN_PERMISOS: PermisosPantalla = { ver: 'NINGUNO', crear: 'NINGUNO', editar: 'NINGUNO', baja: 'NINGUNO' };
// Si varias pantallas habilitan la misma acción se toma el alcance más amplio
const PESO: Record<Alcance, number> = { NINGUNO: 0, PROPIO: 1, ASIGNADO: 1, LIMITADO: 2, PLENO: 3 };
const ROL_ADMIN = 'admin';
// Los permisos se vuelven a leer de la base como máximo cada 30 segundos
const TTL_CACHE_MS = 30_000;

@Injectable()
export class PermisosService {
  // rolId -> clave de pantalla -> permisos. Se recarga cuando se guarda la matriz de un rol y también cada
  // TTL_CACHE_MS, para que un cambio hecho directamente en la base (por ejemplo corriendo el script de roles) se note solo.
  private cache = new Map<number, { vence: number; mapa: Map<string, PermisosPantalla> }>();

  constructor(
    @InjectRepository(Pantalla) private readonly pantallaRepo: Repository<Pantalla>,
    @InjectRepository(RolPermiso) private readonly permisoRepo: Repository<RolPermiso>,
    @InjectRepository(Rol) private readonly rolRepo: Repository<Rol>,
  ) {}

  private async cargarRol(rolId: number) {
    const hit = this.cache.get(rolId);
    if (hit && hit.vence > Date.now()) return hit.mapa;
    const filas = await this.permisoRepo.find({ where: { rolId }, relations: ['pantalla'] });
    const mapa = new Map<string, PermisosPantalla>();
    for (const f of filas) {
      if (!f.pantalla?.isActive) continue;
      mapa.set(f.pantalla.clave, { ver: f.ver, crear: f.crear, editar: f.editar, baja: f.baja });
    }
    this.cache.set(rolId, { vence: Date.now() + TTL_CACHE_MS, mapa });
    return mapa;
  }

  /**
   * Mejor alcance que tiene el rol para la acción en alguna de las pantallas indicadas.
   * Una clave terminada en "+" (ej. 'dashboard+') cuenta solo si el alcance es PLENO o LIMITADO: sirve para
   * rutas que devuelven datos de todos y no deben abrirse a quien solo ve lo propio o lo asignado.
   * Terminada en "!" cuenta solo si el alcance es PLENO.
   */
  async alcance(rolId: number | undefined, claves: string[], accion: Accion): Promise<Alcance> {
    if (!rolId) return 'NINGUNO';
    const mapa = await this.cargarRol(rolId);
    let mejor: Alcance = 'NINGUNO';
    for (const claveCruda of claves) {
      const soloAmplio = claveCruda.endsWith('+');
      const soloPleno = claveCruda.endsWith('!');
      const clave = soloAmplio || soloPleno ? claveCruda.slice(0, -1) : claveCruda;
      const a = (mapa.get(clave) ?? SIN_PERMISOS)[accion];
      if (soloAmplio && a !== 'PLENO' && a !== 'LIMITADO') continue;
      if (soloPleno && a !== 'PLENO') continue;
      if (PESO[a] > PESO[mejor]) mejor = a;
    }
    return mejor;
  }

  /** Lanza 403 si el rol no puede ejecutar la acción (para chequeos puntuales dentro de un servicio o controlador). */
  async exigir(rolId: number | undefined, claves: string[], accion: Accion) {
    if ((await this.alcance(rolId, claves, accion)) === 'NINGUNO') {
      throw new ForbiddenException('No tenés permisos para realizar esta acción.');
    }
  }

  /** Permisos del rol por clave de pantalla (los usa el frontend para armar el menú y las acciones). */
  async permisosDeRol(rolId: number) {
    const mapa = await this.cargarRol(rolId);
    const pantallas = await this.pantallaRepo.find({ where: { isActive: true }, order: { orden: 'ASC', id: 'ASC' } });
    return Object.fromEntries(pantallas.map((p) => [p.clave, mapa.get(p.clave) ?? SIN_PERMISOS]));
  }

  listarPantallas() {
    return this.pantallaRepo.find({ where: { isActive: true }, order: { orden: 'ASC', id: 'ASC' } });
  }

  /** Matriz completa de un rol (una fila por pantalla), para la pantalla de Roles. */
  async matrizDeRol(rolId: number) {
    const rol = await this.rolRepo.findOne({ where: { id: rolId } });
    if (!rol) throw new NotFoundException(`Rol ${rolId} no encontrado`);
    const [pantallas, filas] = await Promise.all([this.listarPantallas(), this.permisoRepo.find({ where: { rolId } })]);
    const porPantalla = new Map(filas.map((f) => [f.pantallaId, f]));
    return {
      rol: { id: rol.id, nombre: rol.nombre },
      permisos: pantallas.map((p) => {
        const f = porPantalla.get(p.id);
        return {
          pantallaId: p.id,
          clave: p.clave,
          nombre: p.nombre,
          seccion: p.seccion,
          notas: p.notas,
          ver: f?.ver ?? 'NINGUNO',
          crear: f?.crear ?? 'NINGUNO',
          editar: f?.editar ?? 'NINGUNO',
          baja: f?.baja ?? 'NINGUNO',
        };
      }),
    };
  }

  /** Reemplaza los permisos de un rol. Nadie puede cambiar su propio rol y el rol Admin no se modifica. */
  async guardarMatriz(rolId: number, dto: GuardarPermisosDto, rolIdSolicitante: number | undefined) {
    const rol = await this.rolRepo.findOne({ where: { id: rolId } });
    if (!rol) throw new NotFoundException(`Rol ${rolId} no encontrado`);
    if (rol.nombre.trim().toLowerCase() === ROL_ADMIN) {
      throw new ForbiddenException('Los permisos del rol Admin no se pueden modificar.');
    }
    if (rolIdSolicitante === rolId) {
      throw new ForbiddenException('No podés modificar los permisos de tu propio rol.');
    }

    const ids = dto.permisos.map((p) => p.pantallaId);
    if (new Set(ids).size !== ids.length) throw new BadRequestException('Hay pantallas repetidas en la lista.');
    const existentes = new Set((await this.pantallaRepo.find({ where: { isActive: true } })).map((p) => p.id));
    const desconocida = ids.find((id) => !existentes.has(id));
    if (desconocida !== undefined) throw new BadRequestException(`La pantalla ${desconocida} no existe.`);
    for (const p of dto.permisos) {
      for (const a of [p.ver, p.crear, p.editar, p.baja]) {
        if (!(ALCANCES as readonly string[]).includes(a)) throw new BadRequestException(`Alcance inválido: ${a}`);
      }
    }

    await this.permisoRepo.manager.transaction(async (manager) => {
      const repo = manager.getRepository(RolPermiso);
      await repo.delete({ rolId });
      if (dto.permisos.length) {
        await repo.insert(
          dto.permisos.map((p) => ({
            rolId,
            pantallaId: p.pantallaId,
            ver: p.ver as Alcance,
            crear: p.crear as Alcance,
            editar: p.editar as Alcance,
            baja: p.baja as Alcance,
          })),
        );
      }
    });
    this.cache.delete(rolId);
    return this.matrizDeRol(rolId);
  }

  /** Permisos iniciales de un rol nuevo: sin acceso a nada. */
  async crearSinPermisos(rolId: number) {
    const pantallas = await this.listarPantallas();
    if (!pantallas.length) return;
    await this.permisoRepo.insert(pantallas.map((p) => ({ rolId, pantallaId: p.id })));
    this.cache.delete(rolId);
  }

  invalidarCache() {
    this.cache.clear();
  }
}
