import {
  BadRequestException,
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { GeoService } from './geo.service';
import { MIN_CARACTERES, MAX_CARACTERES } from '@app/utils/helpers';
const { NoAuditar } = require('../auditoria/entities/listado-acciones');

@NoAuditar()
@ApiTags('geo')
@UseGuards(ThrottlerGuard)
@Throttle({ default: { limit: 60, ttl: 60_000 } })
@Controller('geo')
export class GeoController {
  constructor(private readonly geoService: GeoService) {}

  @Get('buscar')
  buscar(@Query('q') q = '') {
    const texto = q.trim();
    if (texto.length < MIN_CARACTERES) {
      throw new BadRequestException(
        `Escribí al menos ${MIN_CARACTERES} caracteres`,
      );
    }
    return this.geoService.buscar(texto.slice(0, MAX_CARACTERES));
  }

  @Get('inversa')
  inversa(@Query('lat') lat: string, @Query('lng') lng: string) {
    const latitud = Number(lat);
    const longitud = Number(lng);
    if (!Number.isFinite(latitud) || !Number.isFinite(longitud)) {
      throw new BadRequestException('Coordenadas inválidas');
    }
    return this.geoService.inversa(latitud, longitud);
  }
}
