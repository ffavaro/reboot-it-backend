import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rol } from './rol.entity';
import { CreateRolDto } from './dto/create-rol.dto';
import { UpdateRolDto } from './dto/update-rol.dto';
import { Usuario } from '@app/usuarios/usuario.entity';
import { Empleado } from '@app/empleados/empleado.entity';
import { PermisosService } from '@app/permisos/permisos.service';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Rol)
    private readonly rolRepository: Repository<Rol>,
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    @InjectRepository(Empleado)
    private readonly empleadoRepository: Repository<Empleado>,
    private readonly permisos: PermisosService

  ) { }

  create = async (dto: CreateRolDto) => {
    const rol = await this.rolRepository.save(this.rolRepository.create(dto));
    await this.permisos.crearSinPermisos(rol.id);
    return rol;
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

  remove = async (id: number) => {
    const rol = await this.findOne(id);
    if (rol.esSistema) {
      throw new ForbiddenException('Los roles del sistema no se pueden dar de baja.');
    }

    const [usuarios, empleados] = await Promise.all([
      this.usuarioRepository.count({ where: { rolId: id, isActive: true } }),
      this.empleadoRepository.count({ where: { rolId: id, isActive: true } }),
    ]);
    if (usuarios || empleados) {
      throw new ConflictException('El rol tiene usuarios o empleados asignados: reasignalos antes de darlo de baja.');
    }

    await this.rolRepository.update(id, { isActive: false });
    return { message: 'Rol desactivado' };
  }
}
