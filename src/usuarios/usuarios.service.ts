import { Injectable, NotFoundException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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

  async create(dto: CreateUsuarioDto) {
    try {
      const plainPassword = dto.password || DEFAULT_PASSWORD;
      const hashedPassword = await bcrypt.hash(plainPassword, SALT_ROUNDS);
      const usuario = this.usuarioRepository.create({ ...dto, password: hashedPassword });
      return await this.usuarioRepository.save(usuario);
    } catch (error) {
      if (error?.code === 'ER_DUP_ENTRY') {
        throw new ConflictException('El email ya está registrado');
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
    await this.usuarioRepository.update(id, dto);
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
