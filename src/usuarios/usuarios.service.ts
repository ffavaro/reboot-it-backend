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
  ) { }

  create = async (dto: CreateUsuarioDto) => {
    try {
      const plainPassword = dto.password || DEFAULT_PASSWORD;
      const hashedPassword = await bcrypt.hash(plainPassword, SALT_ROUNDS);
      const usuario = this.usuarioRepository.create({ ...dto, password: hashedPassword });
      return await this.usuarioRepository.save(usuario);
    } catch (error) {
       const conflicto = this.conflictoPorDuplicado(error);
       if (conflicto) throw conflicto
      throw new InternalServerErrorException('Error al crear usuario');
    }
  }

  findAll() {
    return this.usuarioRepository.find({
      where: { isActive: true },
      relations: ['rol', 'empleado'],
    });
  }

  findOne = async (id: number) => {
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

  update = async (id: number, dto: UpdateUsuarioDto) => {
    await this.findOne(id);
    try {
      await this.usuarioRepository.update(id, dto);      
    } catch (error) {
      throw this.conflictoPorDuplicado(error) ?? error;
    }
    return this.findOne(id);
  }


  remove = async (id: number) => {
    await this.findOne(id);
    await this.usuarioRepository.update(id, { isActive: false });
    return { message: 'Usuario desactivado' };
  }

  private conflictoPorDuplicado(error: unknown): ConflictException | null {
    const { code, sqlMessage } = (error ?? {}) as {
      code?: string;
      sqlMessage?: string;
    };
    if (code !== 'ER_DUP_ENTRY') return null;
    return new ConflictException(
      sqlMessage?.includes('cuit_dni')
        ? 'El CUIT/DNI ya está registrado'
        : 'El email ya está registrado',
    );
  }
}
