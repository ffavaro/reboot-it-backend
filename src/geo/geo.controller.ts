import { BadRequestException, Controller, Get, Query, UseGuards } from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { Public } from '../auth/auth.decorators';
import { NoAuditar } from '../auditoria/auditoria.acciones';
import { GeoService } from './geo.service';

// Público porque el registro de donantes también usa el buscador de direcciones
@Public()
@NoAuditar()
@UseGuards(ThrottlerGuard)
@Throttle({ default: { limit: 60, ttl: 60 * 1000 } })
@Controller('geo')
export class GeoController {
  constructor(private readonly geo: GeoService) {}

  @Get('buscar')
  buscar(@Query('q') q?: string) {
    const texto = (q ?? '').trim();
    if (texto.length < 3) throw new BadRequestException('Escribí al menos 3 caracteres');
    return this.geo.buscar(texto.slice(0, 200));
  }

  @Get('inversa')
  inversa(@Query('lat') lat: string, @Query('lng') lng: string) {
    const la = Number(lat);
    const ln = Number(lng);
    if (!Number.isFinite(la) || !Number.isFinite(ln)) throw new BadRequestException('Coordenadas inválidas');
    return this.geo.inversa(la, ln);
  }
}
