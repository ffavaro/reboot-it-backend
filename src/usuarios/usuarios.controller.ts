import { BadRequestException, Body, Controller, Delete, ForbiddenException, Get, Param, Patch, Post, Req } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { UsuariosService } from './usuarios.service';
import { Pantalla, ROL_ID_DONANTE } from '../auth/auth.decorators';
import type { RequestConUsuario } from '../auth/auth-user';

// Quien solo tiene permiso "propio" (Mi Perfil) puede ver y editar únicamente su propio usuario
function soloSiMismo(req: RequestConUsuario, id: number) {
  if (req.permiso?.alcance === 'PROPIO' && req.user?.id !== id) {
    throw new ForbiddenException('Solo podés ver y modificar tus propios datos.');
  }
}

@Pantalla('usuarios')
@ApiTags('usuarios')
@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un usuario' })
  @ApiResponse({ status: 201, description: 'Usuario creado exitosamente' })
  create(@Body() dto: CreateUsuarioDto) {
    // Los usuarios con rol Donante se crean junto con su donante (pantalla Donantes o registro público)
    if (dto.rolId === ROL_ID_DONANTE) {
      throw new BadRequestException('Los usuarios con rol Donante se crean desde Donantes');
    }
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
    soloSiMismo(req, +id);
    return this.usuariosService.findOne(+id);
  }

  @Pantalla('usuarios', 'mi_perfil')
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un usuario' })
  update(@Param('id') id: string, @Body() dto: UpdateUsuarioDto, @Req() req: RequestConUsuario) {
    soloSiMismo(req, +id);
    return this.usuariosService.update(+id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Desactivar un usuario (soft delete)' })
  remove(@Param('id') id: string) {
    return this.usuariosService.remove(+id);
  }
}
