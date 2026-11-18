import { Injectable, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { CrudService } from '@app/common/crud/crud-service';
import { Usuario } from './usuario.entity';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';

@Injectable()
export class UsuariosService extends CrudService<Usuario, CreateUsuarioDto, UpdateUsuarioDto> {
  constructor(@InjectRepository(Usuario) repo: Repository<Usuario>) {
    super(repo, { etiqueta: 'Usuario', genero: 'm', relations: ['rol', 'empleado'] });
  }

  async create(dto: CreateUsuarioDto) {
    try {
      const password = await this.hashear(dto.password || 'reboot2024_it');
      return await this.repo.save(this.repo.create({ ...dto, password }));
    } catch (error) {
      throw this.conflictoPorDuplicado(error) ?? new InternalServerErrorException('Error al crear usuario');
    }
  }

  findByEmail(email: string) {
    return this.repo.findOne({ where: { email }, relations: ['rol'] });
  }

  async update(id: number, dto: UpdateUsuarioDto) {
    await this.findOne(id);
    const datos = dto.password ? { ...dto, password: await this.hashear(dto.password) } : dto;
    try {
      await this.repo.update(id, datos);
    } catch (error) {
      throw this.conflictoPorDuplicado(error) ?? error;
    }
    return this.findOne(id);
  }

  private hashear(password: string) {
    return bcrypt.hash(password, 10);
  }

  private conflictoPorDuplicado(error: unknown): ConflictException | null {
    const { code, sqlMessage } = (error ?? {}) as { code?: string; sqlMessage?: string };
    if (code !== 'ER_DUP_ENTRY') return null;
    return new ConflictException(sqlMessage?.includes('cuit_dni') ? 'El CUIT/DNI ya está registrado' : 'El email ya está registrado');
  }
}
