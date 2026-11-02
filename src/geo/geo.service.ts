import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DireccionGeo, RespuestaGeocode, ResultadoGeocode } from '../interfaces/geo.types';

const GEOCODE_URL = 'https://maps.googleapis.com/maps/api/geocode/json';
const MAX_SUGERENCIAS = 5;

@Injectable()
export class GeoService {
  constructor(private readonly config: ConfigService) {}

  async buscar(texto: string): Promise<DireccionGeo[]> {
    const resultados = await this.consultar({
      address: texto,
      components: 'country:AR|administrative_area:Córdoba',
      bounds: '-35.0,-65.8|-29.5,-61.8',
      region: 'ar',
      language: 'es',
    });
    return resultados.slice(0, MAX_SUGERENCIAS);
  }

  async inversa(lat: number, lng: number): Promise<DireccionGeo | null> {
    const [primero] = await this.consultar({
      latlng: `${lat},${lng}`,
      result_type: 'street_address|route|premise',
      language: 'es',
    });
    return primero ?? null;
  }

  private async consultar(
    parametros: Record<string, string>,
  ): Promise<DireccionGeo[]> {
    const key = this.config.get<string>('GOOGLE_MAPS_API_KEY')?.trim();
    if (!key)
      throw new ServiceUnavailableException(
        'Falta configurar GOOGLE_MAPS_API_KEY',
      );

    const url = `${GEOCODE_URL}?${new URLSearchParams({ ...parametros, key }).toString()}`;
    const respuesta = await fetch(url);
    if (!respuesta.ok)
      throw new ServiceUnavailableException('No se pudo consultar Google Maps');

    const datos = (await respuesta.json()) as RespuestaGeocode;
    if (datos.status === 'ZERO_RESULTS') return [];
    if (datos.status !== 'OK') {
      throw new ServiceUnavailableException(
        `Google Maps: ${datos.error_message ?? datos.status}`,
      );
    }
    return datos.results.map((r) => this.aDireccion(r));
  }

  private aDireccion(resultado: ResultadoGeocode): DireccionGeo {
    const componente = (tipo: string) =>
      resultado.address_components.find((c) => c.types.includes(tipo))
        ?.long_name ?? null;

    const calle = componente('route');
    const numero = componente('street_number');
    const localidad =
      componente('locality') ??
      componente('sublocality') ??
      componente('administrative_area_level_2');
    const provincia = componente('administrative_area_level_1');
    const etiqueta = calle
      ? [[calle, numero].filter(Boolean).join(' '), localidad, provincia]
          .filter(Boolean)
          .join(', ')
      : resultado.formatted_address;

    return {
      etiqueta,
      calle,
      numero,
      localidad,
      provincia,
      lat: resultado.geometry.location.lat,
      lng: resultado.geometry.location.lng,
    };
  }
}
