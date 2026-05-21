import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rol } from './rol.entity';
import { CreateRolDto } from './dto/create-rol.dto';
import { UpdateRolDto } from './dto/update-rol.dto';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Rol)
    private readonly rolRepository: Repository<Rol>,
  ) {}

  create(dto: CreateRolDto) {
    const rol = this.rolRepository.create(dto);
    return this.rolRepository.save(rol);
  }

  findAll() {
    return this.rolRepository.find({ where: { isActive: true } });
  }

  async findOne(id: number) {
    const rol = await this.rolRepository.findOne({ where: { id } });
    if (!rol) throw new NotFoundException(`Rol ${id} no encontrado`);
    return rol;
  }

  async update(id: number, dto: UpdateRolDto) {
    await this.findOne(id);
    await this.rolRepository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.rolRepository.update(id, { isActive: false });
    return { message: 'Rol desactivado' };
  }
}
