import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rol } from './rol.entity';
import { CreateRolDto } from './dto/create-rol.dto';
import { UpdateRolDto } from './dto/update-rol.dto';
import { Usuario } from '../usuarios/usuario.entity';
import { Empleado } from '../empleados/empleado.entity';
import { PermisosService } from '../permisos/permisos.service';

// Roles que el sistema necesita para funcionar: no se pueden dar de baja
const ROLES_DEL_SISTEMA = ['admin', 'administrativo', 'tecnico', 'transportista', 'donante'];
const sinTildes = (s: string) => s.normalize('NFD').replace(new RegExp('[' + String.fromCharCode(0x300) + '-' + String.fromCharCode(0x36f) + ']', 'g'), '').toLowerCase().trim();

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Rol)
    private readonly rolRepository: Repository<Rol>,
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    @InjectRepository(Empleado)
    private readonly empleadoRepository: Repository<Empleado>,
    private readonly permisos: PermisosService,
  ) {}

  async create(dto: CreateRolDto) {
    const rol = await this.rolRepository.save(this.rolRepository.create(dto));
    // Un rol nuevo arranca sin acceso a nada; los permisos se le asignan desde la matriz
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

  async remove(id: number) {
    const rol = await this.findOne(id);
    if (ROLES_DEL_SISTEMA.includes(sinTildes(rol.nombre))) {
      throw new ForbiddenException('Los roles del sistema no se pueden dar de baja.');
    }
    const [usuarios, empleados] = await Promise.all([
      this.usuarioRepository.count({ where: { rolId: id, isActive: true } }),
      this.empleadoRepository.count({ where: { rolId: id, isActive: true } }),
    ]);
    if (usuarios > 0 || empleados > 0) {
      throw new ConflictException('El rol tiene usuarios o empleados asignados: reasignalos antes de darlo de baja.');
    }
    await this.rolRepository.update(id, { isActive: false });
    return { message: 'Rol desactivado' };
  }
}
