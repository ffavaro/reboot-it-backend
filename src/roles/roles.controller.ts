import { ParseIdPipe } from '../common/pipes/parse-id.pipe';
import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateRolDto } from './dto/create-rol.dto';
import { UpdateRolDto } from './dto/update-rol.dto';
import { RolesService } from './roles.service';
import { Pantalla } from '../auth/auth.decorators';

@Pantalla('roles')
@ApiTags('roles')
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un rol' })
  @ApiResponse({ status: 201, description: 'Rol creado exitosamente' })
  create(@Body() dto: CreateRolDto) {
    return this.rolesService.create(dto);
  }

  @Pantalla('roles', 'usuarios', 'empleados')
  @Get()
  @ApiOperation({ summary: 'Listar todos los roles activos' })
  findAll() {
    return this.rolesService.findAll();
  }

  @Pantalla('roles', 'usuarios', 'empleados')
  @Get(':id')
  @ApiOperation({ summary: 'Obtener un rol por ID' })
  @ApiResponse({ status: 404, description: 'Rol no encontrado' })
  findOne(@Param('id', ParseIdPipe) id: number) {
    return this.rolesService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un rol' })
  update(@Param('id', ParseIdPipe) id: number, @Body() dto: UpdateRolDto) {
    return this.rolesService.update(+id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Desactivar un rol (soft delete)' })
  remove(@Param('id', ParseIdPipe) id: number) {
    return this.rolesService.remove(+id);
  }
}
