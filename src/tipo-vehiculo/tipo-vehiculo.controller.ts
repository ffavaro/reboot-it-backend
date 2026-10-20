import { Body, Controller, Delete, ForbiddenException, Get, Param, Patch, Post, Req } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { TipoVehiculoService } from './tipo-vehiculo.service';
import { CreateTipoVehiculoDto } from './dto/create-tipo-vehiculo.dto';
import { UpdateTipoVehiculoDto } from './dto/update-tipo-vehiculo.dto';
import { Pantalla } from '../auth/auth.decorators';
import type { RequestConUsuario } from '../auth/auth-user';
import { AmbitoService } from '../permisos/ambito.service';

@Pantalla('vehiculos')
@ApiTags('tipo-vehiculo')
@Controller('tipo-vehiculo')
export class TipoVehiculoController {
  constructor(
    private readonly tipoVehiculoService: TipoVehiculoService,
    private readonly ambito: AmbitoService,
  ) {}

  // Los tipos de vehículo son un catálogo: quien solo ve su vehículo asignado puede consultarlos, no modificarlos
  private async soloEquipo(req: RequestConUsuario) {
    if (await this.ambito.de(req)) throw new ForbiddenException('No tenés permisos para modificar este catálogo.');
  }

  @Post()
  @ApiOperation({ summary: 'Crear un tipo de vehículo' })
  async create(@Body() dto: CreateTipoVehiculoDto, @Req() req: RequestConUsuario) {
    await this.soloEquipo(req);
    return this.tipoVehiculoService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los tipos de vehículo activos' })
  findAll() {
    return this.tipoVehiculoService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un tipo de vehículo por ID' })
  findOne(@Param('id') id: string) {
    return this.tipoVehiculoService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un tipo de vehículo' })
  async update(@Param('id') id: string, @Body() dto: UpdateTipoVehiculoDto, @Req() req: RequestConUsuario) {
    await this.soloEquipo(req);
    return this.tipoVehiculoService.update(+id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Desactivar un tipo de vehículo (soft delete)' })
  async remove(@Param('id') id: string, @Req() req: RequestConUsuario) {
    await this.soloEquipo(req);
    return this.tipoVehiculoService.remove(+id);
  }
}
