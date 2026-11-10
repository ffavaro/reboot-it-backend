import { Body, Controller, Delete, ForbiddenException, Get, Param, Patch, Post, Req } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { UsuariosService } from './usuarios.service';
import type { RequestConUsuario } from '../interfaces/auth.type';
import { PermisosService } from '../permisos/permisos.service';
import { Pantalla } from '../auth/permisos.decorators';

const CAMPOS_DE_MI_PERFIL = ['nombre', 'email', 'password'];

function soloSobreSiMismo(req: RequestConUsuario, id: number) {
  if (req.acceso?.alcance === 'PROPIOS' && req.user?.id !== id) {
    throw new ForbiddenException('Solo podés ver y modificar tus propios datos.');
  }
}

@Pantalla('usuarios')
@ApiTags('usuarios')
@Controller('usuarios')
export class UsuariosController {
  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly permisos: PermisosService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Crear un usuario' })
  @ApiResponse({ status: 201, description: 'Usuario creado exitosamente' })
  async create(@Body() dto: CreateUsuarioDto, @Req() req: RequestConUsuario) {
    await this.permisos.exigirPuedeAsignarRol(dto.rolId, req.user?.rolId);
    return this.usuariosService.create(dto);
  }

  @Pantalla('usuarios', 'empleados')
  @Get()
  @ApiOperation({ summary: 'Listar todos los usuarios activos' })
  findAll() {
    return this.usuariosService.findAll();
  }

  @Pantalla('usuarios', 'empleados', 'mi_perfil')
  @Get(':id')
  @ApiOperation({ summary: 'Obtener un usuario por ID' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  findOne(@Param('id') id: string, @Req() req: RequestConUsuario) {
    soloSobreSiMismo(req, +id);
    return this.usuariosService.findOne(+id);
  }

  @Pantalla('usuarios', 'mi_perfil')
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un usuario' })
  async update(@Param('id') id: string, @Body() dto: UpdateUsuarioDto, @Req() req: RequestConUsuario) {
    soloSobreSiMismo(req, +id);
    await this.permisos.exigirPuedeAsignarRol(dto.rolId, req.user?.rolId);
    if (req.acceso?.alcance === 'PROPIOS') {
      const noPermitidos = Object.entries(dto)
        .filter(([campo, valor]) => valor !== undefined && !CAMPOS_DE_MI_PERFIL.includes(campo))
        .map(([campo]) => campo);
      if (noPermitidos.length) {
        throw new ForbiddenException('Desde Mi perfil solo podés cambiar tu nombre, email y contraseña.');
      }
    }
    return this.usuariosService.update(+id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Desactivar un usuario (soft delete)' })
  remove(@Param('id') id: string) {
    return this.usuariosService.remove(+id);
  }
}
