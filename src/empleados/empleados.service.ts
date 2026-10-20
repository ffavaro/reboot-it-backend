import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Not, Repository } from 'typeorm';
import { Empleado } from './empleado.entity';
import { CreateEmpleadoDto } from './dto/create-empleado.dto';
import { UpdateEmpleadoDto } from './dto/update-empleado.dto';
import { Usuario } from '../usuarios/usuario.entity';
import { UsuariosService } from '../usuarios/usuarios.service';
import { Rol } from '../roles/rol.entity';
import { EmpleadoTransportista } from '../empleado-transportista/empleado-transportista.entity';
import { Vehiculo } from '../vehiculos/vehiculo.entity';
import { DatosTransportistaDto } from './dto/create-empleado.dto';

export type EstadoEmpleados = 'activos' | 'inactivos' | 'todos';

// Quien hace el pedido: se usa para las reglas que dependen del rol (token del usuario)
export interface ActorEmpleados {
  id?: number;
  empleadoId?: number | null;
  rol?: { nombre: string };
}
const esAdmin = (actor?: ActorEmpleados) => (actor?.rol?.nombre ?? '').trim().toLowerCase() === 'admin';

@Injectable()
export class EmpleadosService {
  constructor(
    @InjectRepository(Empleado)
    private readonly empleadoRepository: Repository<Empleado>,
    private readonly dataSource: DataSource,
    private readonly usuariosService: UsuariosService,
  ) {}

  // Incluye empleados inactivos, porque el índice único de la base también los cuenta
  private async assertCuitDniUnico(cuitDni?: string, excludeId?: number) {
    if (!cuitDni) return;
    const idFilter = excludeId ? { id: Not(excludeId) } : {};
    if (await this.empleadoRepository.exists({ where: { cuitDni, ...idFilter } })) {
      throw new ConflictException('El CUIT/DNI ya está registrado en otro empleado');
    }
  }

  /**
   * Crea el empleado y, en el mismo paso, su usuario (con el email y la contraseña recibidos, y el
   * mismo nombre, apellido, CUIT/DNI y rol del empleado), vinculado por usuario.empleado_id.
   * Todo en una transacción: si el usuario no se puede crear (email o CUIT/DNI repetidos), no queda
   * tampoco el empleado.
   */
  // Solo el SysAdmin (Admin) puede dar el rol Admin
  private async assertPuedeAsignarRol(rolId: number, actor?: ActorEmpleados) {
    const rol = await this.dataSource.getRepository(Rol).findOne({ where: { id: rolId } });
    if (rol && rol.nombre.trim().toLowerCase() === 'admin' && !esAdmin(actor)) {
      throw new ForbiddenException('Solo el SysAdmin puede asignar el rol Admin.');
    }
  }

  private async esRolTransportista(rolId: number): Promise<boolean> {
    const rol = await this.dataSource.getRepository(Rol).findOne({ where: { id: rolId } });
    return !!rol && rol.nombre.trim().toLowerCase() === 'transportista';
  }

  // Un transportista necesita carnet y un vehículo existente para la ficha
  private async validarTransportista(manager: EntityManager, tieneCarnet: boolean | undefined, datos?: DatosTransportistaDto) {
    if (!datos) {
      throw new BadRequestException('Para un empleado transportista hay que indicar el vehículo que va a utilizar y los datos de su carnet.');
    }
    if (!tieneCarnet) {
      throw new BadRequestException('Un transportista necesita carnet de conducir: marcá "Tiene carnet de conducir".');
    }
    const vehiculo = await manager.getRepository(Vehiculo).findOne({ where: { id: datos.vehiculoId, isActive: true } });
    if (!vehiculo) throw new NotFoundException(`Vehículo ${datos.vehiculoId} no encontrado`);
  }

  async create(dto: CreateEmpleadoDto, actor?: ActorEmpleados) {
    const { email, password, transportista, ...datos } = dto;
    await this.assertPuedeAsignarRol(datos.rolId, actor);
    const esTransportista = await this.esRolTransportista(datos.rolId);
    if (!esTransportista && transportista) {
      throw new BadRequestException('Los datos de transportista solo se cargan cuando el rol es Transportista.');
    }
    await this.assertCuitDniUnico(datos.cuitDni);
    return this.dataSource.transaction(async (manager) => {
      if (esTransportista) await this.validarTransportista(manager, datos.tieneCarnet, transportista);
      const empleado = await manager.save(manager.create(Empleado, datos));
      await this.usuariosService.crearEnTransaccion(manager, {
        nombre: datos.nombre,
        apellido: datos.apellido,
        cuitDni: datos.cuitDni,
        email,
        password,
        rolId: datos.rolId,
        empleadoId: empleado.id,
        isActive: true,
      });
      // Rol Transportista: se registra también su ficha de transportista, con el vehículo y el carnet
      if (esTransportista && transportista) {
        await manager.save(manager.create(EmpleadoTransportista, { ...transportista, empleadoId: empleado.id, fechaAsignacion: new Date() }));
      }
      return empleado;
    });
  }

  /** Por defecto solo los activos; el SysAdmin puede pedir los desactivados o todos. */
  findAll(estado: EstadoEmpleados = 'activos') {
    return this.empleadoRepository.find({
      where: estado === 'todos' ? {} : { isActive: estado === 'activos' },
      relations: ['rol'],
    });
  }

  async findOne(id: number) {
    const empleado = await this.empleadoRepository.findOne({
      where: { id },
      relations: ['rol'],
    });
    if (!empleado) throw new NotFoundException(`Empleado ${id} no encontrado`);
    return empleado;
  }

  async update(id: number, dtoCompleto: UpdateEmpleadoDto, actor?: ActorEmpleados) {
    const { transportista, ...dto } = dtoCompleto;
    const actual = await this.findOne(id);
    if (dto.rolId !== undefined && dto.rolId !== actual.rolId) {
      // Cambiar el rol cambia los accesos del empleado: es exclusivo del SysAdmin
      if (!esAdmin(actor)) throw new ForbiddenException('Solo el SysAdmin puede cambiar el rol de un empleado.');
      await this.assertPuedeAsignarRol(dto.rolId, actor);
    }
    if (dto.tieneCarnet === false && actual.tieneCarnet) {
      const esTransportista = await this.dataSource.getRepository(EmpleadoTransportista).exists({ where: { empleadoId: id, isActive: true } });
      if (esTransportista) throw new ConflictException('El empleado es transportista: no se le puede quitar el carnet mientras tenga la ficha activa.');
    }
    await this.assertCuitDniUnico(dto.cuitDni, id);

    // Cambio de rol hacia o desde Transportista: la ficha de transportista acompaña al rol
    const cambiaRol = dto.rolId !== undefined && dto.rolId !== actual.rolId;
    const pasaATransportista = cambiaRol && (await this.esRolTransportista(dto.rolId as number));
    const dejaDeSerTransportista = cambiaRol && !pasaATransportista && (await this.esRolTransportista(actual.rolId));
    if (!pasaATransportista && transportista) {
      throw new BadRequestException('Los datos de transportista solo se cargan al pasar el empleado al rol Transportista.');
    }

    // El usuario del empleado comparte nombre, apellido, CUIT/DNI y rol: se mantienen al día
    const datosUsuario: Partial<Pick<Usuario, 'nombre' | 'apellido' | 'cuitDni' | 'rolId'>> = {};
    if (dto.nombre !== undefined) datosUsuario.nombre = dto.nombre;
    if (dto.apellido !== undefined) datosUsuario.apellido = dto.apellido;
    if (dto.cuitDni !== undefined) datosUsuario.cuitDni = dto.cuitDni;
    if (dto.rolId !== undefined) datosUsuario.rolId = dto.rolId;

    try {
      await this.dataSource.transaction(async (manager) => {
        if (pasaATransportista) await this.validarTransportista(manager, dto.tieneCarnet ?? !!actual.tieneCarnet, transportista);
        await manager.update(Empleado, id, dto);
        if (pasaATransportista && transportista) {
          // si ya tuvo ficha antes se la reactiva con los datos nuevos; si no, se crea
          const ficha = await manager.getRepository(EmpleadoTransportista).findOne({ where: { empleadoId: id } });
          if (ficha) await manager.update(EmpleadoTransportista, ficha.id, { ...transportista, fechaAsignacion: new Date(), isActive: true });
          else await manager.save(manager.create(EmpleadoTransportista, { ...transportista, empleadoId: id, fechaAsignacion: new Date() }));
        }
        if (dejaDeSerTransportista) await manager.update(EmpleadoTransportista, { empleadoId: id }, { isActive: false });
        if (Object.keys(datosUsuario).length) {
          await manager.update(Usuario, { empleadoId: id }, datosUsuario);
        }
      });
    } catch (error) {
      // el CUIT/DNI del usuario es único entre todos los usuarios (incluidos los donantes)
      if (error?.code === 'ER_DUP_ENTRY') throw new ConflictException('El CUIT/DNI ya está registrado en otro usuario');
      throw error;
    }
    return this.findOne(id);
  }

  /** Habilita o inhabilita al empleado, a su usuario (acceso al sistema) y a su ficha de transportista. Los datos no se borran. */
  private async cambiarEstado(id: number, activo: boolean) {
    await this.dataSource.transaction(async (manager) => {
      await manager.update(Empleado, id, { isActive: activo });
      await manager.update(Usuario, { empleadoId: id }, { isActive: activo });
      await manager.update(EmpleadoTransportista, { empleadoId: id }, { isActive: activo });
    });
  }

  /** "Desactivar": inhabilita el acceso del empleado sin borrar sus datos (se puede reactivar). */
  async remove(id: number, actor?: ActorEmpleados) {
    const empleado = await this.findOne(id);
    if (actor?.empleadoId === id) throw new ForbiddenException('No podés desactivar tu propio empleado.');
    if (!empleado.isActive) return { message: 'El empleado ya estaba desactivado' };
    await this.cambiarEstado(id, false);
    return { message: 'Empleado desactivado' };
  }

  async reactivar(id: number) {
    const empleado = await this.findOne(id);
    if (empleado.isActive) return empleado;
    await this.cambiarEstado(id, true);
    return this.findOne(id);
  }
}
