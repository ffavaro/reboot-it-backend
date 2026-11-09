import { Controller, Get, Body,  Param, Req, ParseIntPipe, Put } from '@nestjs/common';
import { PermisosService } from './permisos.service';
import type { RequestConUsuario } from '@app/interfaces/auth.type';
import { GuardarPermisosDto } from './dto/create-permiso.dto';

@Controller('permisos')
export class PermisosController {
  constructor(private readonly permisosService: PermisosService) { }

  @Get('mias')
  mias(@Req() req: RequestConUsuario) {
    return this.permisosService.permisosDeRol(req.user?.rolId ?? 0)
  }

  @Get('pantallas')
  pantallas() {
    return this.permisosService.listarPantallas()
  }

  @Get('rol/:rolId')
  matriz(@Param('rolId', ParseIntPipe) rolId: number) {
    return this.permisosService.matrizDeRol(rolId)
  }

  @Put('rol/:rolId')
  async actualizar(@Param('rolId') rolId: number,
    @Body() dto: GuardarPermisosDto,
    @Req() req: RequestConUsuario) {
    await this.permisosService.exigir(req.user?.rolId, ['roles'], 'editar')
    return this.permisosService.guardarMatriz(rolId, dto, req.user?.rolId)
  }
}
