import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface DireccionGeo {
  etiqueta: string;
  calle: string | null;
  numero: string | null;
  localidad: string | null;
  provincia: string | null;
  lat: number;
  lng: number;
}

interface Componente { long_name: string; types: string[] }
interface ResultadoGoogle {
  formatted_address: string;
  address_components: Componente[];
  geometry: { location: { lat: number; lng: number } };
}

const GEOCODE_URL = 'https://maps.googleapis.com/maps/api/geocode/json';
// Por defecto se busca en Córdoba, Argentina (sesgo de la búsqueda: la provincia completa, no solo la capital)
const SESGO = 'bounds=-35.0,-65.8|-29.5,-61.8&region=ar&language=es';

@Injectable()
export class GeoService {
  constructor(private readonly config: ConfigService) {}

  async buscar(texto: string): Promise<DireccionGeo[]> {
    const q = `address=${encodeURIComponent(texto)}&components=country:AR|administrative_area:Córdoba&${SESGO}`;
    return (await this.consultar(q)).slice(0, 5);
  }

  async inversa(lat: number, lng: number): Promise<DireccionGeo | null> {
    const q = `latlng=${lat},${lng}&result_type=street_address|route|premise&language=es`;
    return (await this.consultar(q))[0] ?? null;
  }

  private async consultar(query: string): Promise<DireccionGeo[]> {
    const key = this.config.get<string>('GOOGLE_MAPS_API_KEY')?.trim();
    if (!key) throw new ServiceUnavailableException('Falta configurar GOOGLE_MAPS_API_KEY');
    const res = await fetch(`${GEOCODE_URL}?${query}&key=${key}`);
    if (!res.ok) throw new ServiceUnavailableException('No se pudo consultar Google Maps');
    const datos = (await res.json()) as { status: string; results: ResultadoGoogle[]; error_message?: string };
    if (datos.status === 'ZERO_RESULTS') return [];
    if (datos.status !== 'OK') throw new ServiceUnavailableException(`Google Maps: ${datos.error_message ?? datos.status}`);
    return datos.results.map((r) => this.mapear(r));
  }

  private mapear(r: ResultadoGoogle): DireccionGeo {
    const de = (tipo: string) => r.address_components.find((c) => c.types.includes(tipo))?.long_name ?? null;
    const calle = de('route');
    const numero = de('street_number');
    const localidad = de('locality') ?? de('sublocality') ?? de('administrative_area_level_2');
    const provincia = de('administrative_area_level_1');
    const partes = [[calle, numero].filter(Boolean).join(' '), localidad, provincia].filter(Boolean);
    return {
      etiqueta: calle ? partes.join(', ') : r.formatted_address,
      calle, numero, localidad, provincia,
      lat: r.geometry.location.lat,
      lng: r.geometry.location.lng,
    };
  }
}
