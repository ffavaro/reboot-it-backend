import { Body, Controller, Get, Param, ParseIntPipe, Put, Req } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Accion, Authenticated, Pantalla } from '../auth/auth.decorators';
import type { RequestConUsuario } from '../auth/auth-user';
import { PermisosService } from './permisos.service';
import { GuardarPermisosDto } from './dto/guardar-permisos.dto';

@ApiTags('permisos')
@Controller('permisos')
export class PermisosController {
  constructor(private readonly permisosService: PermisosService) {}

  @Authenticated()
  @Get('mias')
  @ApiOperation({ summary: 'Permisos del usuario autenticado por pantalla (para armar menú y acciones)' })
  mias(@Req() req: RequestConUsuario) {
    return this.permisosService.permisosDeRol(req.user!.rolId);
  }

  @Pantalla('roles')
  @Get('pantallas')
  @ApiOperation({ summary: 'Catálogo de pantallas' })
  pantallas() {
    return this.permisosService.listarPantallas();
  }

  @Pantalla('roles')
  @Get('rol/:rolId')
  @ApiOperation({ summary: 'Matriz de permisos de un rol' })
  matriz(@Param('rolId', ParseIntPipe) rolId: number) {
    return this.permisosService.matrizDeRol(rolId);
  }

  @Pantalla('roles')
  @Accion('editar')
  @Put('rol/:rolId')
  @ApiOperation({ summary: 'Reemplazar la matriz de permisos de un rol' })
  guardar(@Param('rolId', ParseIntPipe) rolId: number, @Body() dto: GuardarPermisosDto, @Req() req: RequestConUsuario) {
    return this.permisosService.guardarMatriz(rolId, dto, req.user?.rolId);
  }
}
