import { Injectable, NotFoundException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Usuario } from './usuario.entity';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';

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
  private async assertUnique(data: { email?: string; cuitDni?: string }, excludeId?: number) {
    const idFilter = excludeId ? { id: Not(excludeId) } : {};
    if (data.cuitDni && await this.usuarioRepository.exists({ where: { cuitDni: data.cuitDni, ...idFilter } })) {
      throw new ConflictException('El CUIT/DNI ya está registrado');
    }
    if (data.email && await this.usuarioRepository.exists({ where: { email: data.email, ...idFilter } })) {
      throw new ConflictException('El email ya está registrado');
    }
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
    await this.findOne(id);
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
