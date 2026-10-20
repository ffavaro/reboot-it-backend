import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Not, Repository } from 'typeorm';
import { Empleado } from './empleado.entity';
import { CreateEmpleadoDto } from './dto/create-empleado.dto';
import { UpdateEmpleadoDto } from './dto/update-empleado.dto';
import { Usuario } from '../usuarios/usuario.entity';
import { UsuariosService } from '../usuarios/usuarios.service';

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
  async create(dto: CreateEmpleadoDto) {
    const { email, password, ...datos } = dto;
    await this.assertCuitDniUnico(datos.cuitDni);
    return this.dataSource.transaction(async (manager) => {
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
      return empleado;
    });
  }

  findAll() {
    return this.empleadoRepository.find({
      where: { isActive: true },
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

  async update(id: number, dto: UpdateEmpleadoDto) {
    await this.findOne(id);
    await this.assertCuitDniUnico(dto.cuitDni, id);

    // El usuario del empleado comparte nombre, apellido, CUIT/DNI y rol: se mantienen al día
    const datosUsuario: Partial<Pick<Usuario, 'nombre' | 'apellido' | 'cuitDni' | 'rolId'>> = {};
    if (dto.nombre !== undefined) datosUsuario.nombre = dto.nombre;
    if (dto.apellido !== undefined) datosUsuario.apellido = dto.apellido;
    if (dto.cuitDni !== undefined) datosUsuario.cuitDni = dto.cuitDni;
    if (dto.rolId !== undefined) datosUsuario.rolId = dto.rolId;

    try {
      await this.dataSource.transaction(async (manager) => {
        await manager.update(Empleado, id, dto);
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

  async remove(id: number) {
    await this.findOne(id);
    await this.empleadoRepository.update(id, { isActive: false });
    return { message: 'Empleado desactivado' };
  }
}
