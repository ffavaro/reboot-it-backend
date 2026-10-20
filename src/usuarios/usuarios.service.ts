import { BadRequestException, Injectable, NotFoundException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Not, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Usuario } from './usuario.entity';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { ROL_ID_DONANTE } from '../auth/auth.decorators';

const DEFAULT_PASSWORD = 'reboot2024_it';
const SALT_ROUNDS = 10;

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
  ) {}

  // Verifica email y CUIT/DNI únicos antes de guardar, para informar cuál de los dos está repetido.
  // Incluye usuarios inactivos, porque el índice único de la base también los cuenta.
  // repo: permite hacer la verificación dentro de una transacción (ver crearEnTransaccion)
  private async assertUnique(
    data: { email?: string; cuitDni?: string; empleadoId?: number | null },
    excludeId?: number,
    repo: Repository<Usuario> = this.usuarioRepository,
  ) {
    const idFilter = excludeId ? { id: Not(excludeId) } : {};
    if (data.cuitDni && await repo.exists({ where: { cuitDni: data.cuitDni, ...idFilter } })) {
      throw new ConflictException('El CUIT/DNI ya está registrado en otro usuario');
    }
    if (data.email && await repo.exists({ where: { email: data.email, ...idFilter } })) {
      throw new ConflictException('El email ya está registrado');
    }
    if (data.empleadoId && await repo.exists({ where: { empleadoId: data.empleadoId, ...idFilter } })) {
      throw new ConflictException('Ese empleado ya tiene un usuario asociado');
    }
  }

  /**
   * Crea un usuario dentro de la transacción de quien lo llama (alta de empleado o de donante, que
   * crean su usuario en el mismo paso): si algo falla, no queda ni el usuario ni lo que lo originó.
   */
  async crearEnTransaccion(manager: EntityManager, dto: CreateUsuarioDto) {
    await this.assertUnique(dto, undefined, manager.getRepository(Usuario));
    const password = await bcrypt.hash(dto.password || DEFAULT_PASSWORD, SALT_ROUNDS);
    return manager.save(manager.create(Usuario, { ...dto, password }));
  }

  async create(dto: CreateUsuarioDto) {
    await this.assertUnique(dto);
    try {
      const plainPassword = dto.password || DEFAULT_PASSWORD;
      const hashedPassword = await bcrypt.hash(plainPassword, SALT_ROUNDS);
      const usuario = this.usuarioRepository.create({ ...dto, password: hashedPassword });
      return await this.usuarioRepository.save(usuario);
    } catch (error) {
      if (error?.code === 'ER_DUP_ENTRY') {
        throw new ConflictException('Ya existe un usuario con esos datos');
      }
      console.error('Error al crear usuario:', error);
      throw new InternalServerErrorException('Error al crear usuario');
    }
  }

  findAll() {
    return this.usuarioRepository.find({
      where: { isActive: true },
      relations: ['rol', 'empleado'],
    });
  }

  async findOne(id: number) {
    const usuario = await this.usuarioRepository.findOne({
      where: { id },
      relations: ['rol', 'empleado'],
    });
    if (!usuario) throw new NotFoundException(`Usuario ${id} no encontrado`);
    return usuario;
  }

  findByEmail(email: string) {
    return this.usuarioRepository.findOne({ where: { email }, relations: ['rol'] });
  }

  async update(id: number, dto: UpdateUsuarioDto) {
    const actual = await this.findOne(id);
    // Los usuarios donantes nacen y viven ligados a su donante: el rol no se cambia desde acá
    if (dto.rolId !== undefined && dto.rolId !== actual.rolId && (dto.rolId === ROL_ID_DONANTE || actual.rolId === ROL_ID_DONANTE)) {
      throw new BadRequestException('No se puede cambiar el rol de un usuario hacia o desde Donante');
    }
    await this.assertUnique(dto, id);
    // La contraseña nunca se guarda en texto plano: si viene en el PATCH, se hashea igual que al crear
    const { password, ...resto } = dto;
    await this.usuarioRepository.update(id, password ? { ...resto, password: await bcrypt.hash(password, SALT_ROUNDS) } : resto);
    return this.findOne(id);
  }

  async updatePassword(id: number, hashedPassword: string) {
    await this.usuarioRepository.update(id, { password: hashedPassword });
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.usuarioRepository.update(id, { isActive: false });
    return { message: 'Usuario desactivado' };
  }
}
