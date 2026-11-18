import { ConflictException, ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CrudService } from '@app/common/crud/crud-service';
import { Rol } from './rol.entity';
import { CreateRolDto } from './dto/create-rol.dto';
import { UpdateRolDto } from './dto/update-rol.dto';
import { Usuario } from '@app/usuarios/usuario.entity';
import { Empleado } from '@app/empleados/empleado.entity';
import { PermisosService } from '@app/permisos/permisos.service';

@Injectable()
export class RolesService extends CrudService<Rol, CreateRolDto, UpdateRolDto> {
  constructor(@InjectRepository(Rol) repo: Repository<Rol>, private readonly permisos: PermisosService) {
    super(repo, { etiqueta: 'Rol', genero: 'm' });
  }

  async create(dto: CreateRolDto) {
    const rol = await super.create(dto);
    await this.permisos.crearSinPermisos(rol.id);
    return rol;
  }

  async remove(id: number) {
    const rol = await this.findOne(id);
    if (rol.esSistema) throw new ForbiddenException('Los roles del sistema no se pueden dar de baja.');

    const [usuarios, empleados] = await Promise.all([
      this.repo.manager.count(Usuario, { where: { rolId: id, isActive: true } }),
      this.repo.manager.count(Empleado, { where: { rolId: id, isActive: true } }),
    ]);
    if (usuarios || empleados) {
      throw new ConflictException('El rol tiene usuarios o empleados asignados: reasignalos antes de darlo de baja.');
    }

    return super.remove(id);
  }
}
