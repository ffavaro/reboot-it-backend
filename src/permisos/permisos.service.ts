import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Pantalla } from './entities/pantalla.entity';
import { RolPermiso } from './entities/rol-permisos.entity';
import { Rol } from '@app/roles/rol.entity';
import { Repository } from 'typeorm';
import { Accion, Alcance, AMPLITUD, CodigoRol, PermisoPantalla, PermisosPorClave, ROL, SIN_PERMISOS, VIGENCIA_CACHE_MS } from './permisos.constants';
import { GuardarPermisosDto } from './dto/create-permiso.dto';

@Injectable()
export class PermisosService {
  private readonly cache = new Map<number, { vence: number, permisos: PermisosPorClave }>();
  constructor(
    @InjectRepository(Pantalla)
    private readonly pantallaRepo: Repository<Pantalla>,
    @InjectRepository(RolPermiso)
    private readonly permisoRepo: Repository<RolPermiso>,
    @InjectRepository(Rol)
    private readonly rolRepo: Repository<Rol>
  ) { }

  alcanceConcedido = async (rolId: number | undefined, claves: string[], accion: Accion): Promise<Alcance | null> => {
    if (!rolId) return null;
    const permisos = await this.permisosCacheados(rolId);

    let mejor: Alcance | null = null;

    for (const clave of claves) {
      const permiso = permisos.get(clave);
      if (!permiso?.[accion]) continue;
      if (!mejor || AMPLITUD[permiso.alcance] > AMPLITUD[mejor]) mejor = permiso.alcance;
    }
    return mejor;
  }

  permisosDeRol = async (rolId: number): Promise<Record<string, PermisoPantalla>> => {
    const [permisos, pantallas] = await Promise.all([this.permisosCacheados(rolId), this.listarPantallas()])
    return Object.fromEntries(pantallas.map((p) => [p.clave, permisos.get(p.clave) ?? SIN_PERMISOS]));
  }

  listarPantallas = () => {
    return this.pantallaRepo.find({ where: { isActive: true }, order: { orden: 'ASC', id: 'ASC' } });
  }

  matrizDeRol = async (rolId: number) => {
    const rol = await this.buscarRol(rolId);
    const [pantallas, filas] = await Promise.all([this.listarPantallas(), this.permisoRepo.find({ where: { rolId } })]);
    const porPantalla = new Map(filas.map((f) => [f.pantallaId, f]));

    return {
      rol: { id: rol.id, nombre: rol.nombre, codigo: rol.codigo, esSistema: rol.esSistema },
      permisos: pantallas.map((p) => {
        const fila = porPantalla.get(p.id) ?? SIN_PERMISOS;
        return {
          pantallaId: p.id,
          clave: p.clave,
          nombre: p.nombre,
          seccion: p.seccion,
          ver: fila.ver,
          crear: fila.crear,
          editar: fila.editar,
          baja: fila.baja,
          alcance: fila.alcance
        }
      })
    }
  }


  guardarMatriz = async (rolId: number, dto: GuardarPermisosDto, rolIdSolicitante?: number) => {
    const rol = await this.buscarRol(rolId);
    if (rol.codigo === ROL.ADMIN) {
      throw new ForbiddenException('Los permisos del rol Admin no se pueden modificar.');
    }
    if (rolIdSolicitante === rolId) {
      throw new ForbiddenException('No podés modificar los permisos de tu propio rol.');
    }
    await this.validarPantallas(dto.permisos.map((p) => p.pantallaId));

    await this.permisoRepo.manager.transaction(async (m) => {
      await m.delete(RolPermiso, { rolId });
      if (dto.permisos.length) {
        await m.insert(
          RolPermiso,
          dto.permisos.map((p) => ({ ...p, rolId })),
        );
      }
    });

    this.cache.delete(rolId);
    return this.matrizDeRol(rolId);
  }

  exigirPuedeAsignarRol = async (rolId: number | undefined, rolIdSolicitante?:number): Promise<void> => {
    if (rolId === undefined) return;

    const rol = await this.buscarRol(rolId);

    if ( rol.codigo !== ROL.ADMIN){
       const solicitante = rolIdSolicitante ? await this.rolRepo.findOne({ where: { id: rolIdSolicitante}}) : null;

     if (solicitante?.codigo !== ROL.ADMIN) {
      throw new ForbiddenException('Solo el SysAdmin puede asignar el rol Admin.');
    }
    }
  }

  exigir = async (rolId: number | undefined, claves: string[], accion: Accion): Promise<void> => {
    if (!(await this.alcanceConcedido(rolId, claves, accion))) {
      throw new ForbiddenException('No tenés permisos para realizar esta acción.');
    }
  }

  rolIdPorCodigo = async (codigo: CodigoRol): Promise<number> => {
    const rol = await this.rolRepo.findOne({ where: { codigo, isActive: true } });
    if (!rol) throw new NotFoundException(`No existe el rol con código ${codigo}`);
    return rol.id;
  }

  invalidarCache(): void {
    this.cache.clear();
  }

   private async permisosCacheados(rolId: number): Promise<PermisosPorClave> {
    const guardado = this.cache.get(rolId);
    if (guardado && guardado.vence > Date.now()) return guardado.permisos;

    const filas = await this.permisoRepo.find({ where: { rolId }, relations: ['pantalla'] });
    const permisos: PermisosPorClave = new Map();
    for (const { pantalla, ver, crear, editar, baja, alcance } of filas) {
      if (pantalla?.isActive) permisos.set(pantalla.clave, { ver, crear, editar, baja, alcance });
    }

    this.cache.set(rolId, { vence: Date.now() + VIGENCIA_CACHE_MS, permisos });
    return permisos;
  }

  private async buscarRol(rolId: number): Promise<Rol> {
    const rol = await this.rolRepo.findOne({ where: { id: rolId } });
    if (!rol) throw new NotFoundException(`Rol ${rolId} no encontrado`);
    return rol;
  }

  private async validarPantallas(ids: number[]): Promise<void> {
    if (new Set(ids).size !== ids.length) {
      throw new BadRequestException('Hay pantallas repetidas en la lista.');
    }
    const existentes = new Set((await this.listarPantallas()).map((p) => p.id));
    const desconocida = ids.find((id) => !existentes.has(id));
    if (desconocida !== undefined) {
      throw new BadRequestException(`La pantalla ${desconocida} no existe.`);
    }
  }
  
  
  

}
