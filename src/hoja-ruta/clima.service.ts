import { Injectable, Logger } from '@nestjs/common';

export interface ClimaDia {
  fecha: string;
  // Código WMO del pronóstico (0 = despejado, 61 = lluvia, 95 = tormenta...)
  codigo: number;
  descripcion: string;
  tempMin: number;
  tempMax: number;
  probLluvia: number | null;
  lluviaMm: number | null;
  vientoMaxKmh: number | null;
}

const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';
const CACHE_TTL_MS = 60 * 60 * 1000;
const TIMEOUT_MS = 5000;
// Open-Meteo pronostica hasta 16 días hacia adelante
const MAX_DIAS_ADELANTE = 15;

const DESCRIPCIONES: [number[], string][] = [
  [[0], 'Despejado'],
  [[1, 2], 'Parcialmente nublado'],
  [[3], 'Nublado'],
  [[45, 48], 'Niebla'],
  [[51, 53, 55, 56, 57], 'Llovizna'],
  [[61, 63, 65, 66, 67, 80, 81, 82], 'Lluvia'],
  [[71, 73, 75, 77, 85, 86], 'Nieve'],
  [[95, 96, 99], 'Tormenta'],
];
const describir = (codigo: number) => DESCRIPCIONES.find(([codigos]) => codigos.includes(codigo))?.[1] ?? 'Sin datos';

@Injectable()
export class ClimaService {
  private readonly logger = new Logger(ClimaService.name);
  private readonly cache = new Map<string, { at: number; value: ClimaDia | null }>();

  /**
   * Pronóstico del día en la coordenada dada (Open-Meteo, no requiere clave). Devuelve null si la fecha
   * queda fuera del rango pronosticable o si el servicio no responde: el clima nunca bloquea la hoja de ruta.
   */
  async pronostico(lat: number, lng: number, fecha: string): Promise<ClimaDia | null> {
    const dias = (Date.parse(fecha) - Date.parse(new Date().toISOString().slice(0, 10))) / 86400000;
    if (!Number.isFinite(dias) || dias < -1 || dias > MAX_DIAS_ADELANTE) return null;

    // Redondeado a ~1 km para compartir caché entre rutas de la misma zona
    const cacheKey = `${lat.toFixed(2)}|${lng.toFixed(2)}|${fecha}`;
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.at < CACHE_TTL_MS) return cached.value;

    let value: ClimaDia | null = null;
    try {
      const params = new URLSearchParams({
        latitude: String(lat),
        longitude: String(lng),
        daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum,wind_speed_10m_max',
        timezone: 'auto',
        start_date: fecha,
        end_date: fecha,
      });
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
      const res = await fetch(`${FORECAST_URL}?${params}`, { signal: controller.signal }).finally(() => clearTimeout(timer));
      const data: any = await res.json();
      const d = data?.daily;
      if (res.ok && d?.time?.length) {
        const codigo = Number(d.weather_code?.[0]);
        value = {
          fecha,
          codigo,
          descripcion: describir(codigo),
          tempMin: Math.round(d.temperature_2m_min?.[0]),
          tempMax: Math.round(d.temperature_2m_max?.[0]),
          probLluvia: d.precipitation_probability_max?.[0] ?? null,
          lluviaMm: d.precipitation_sum?.[0] ?? null,
          vientoMaxKmh: d.wind_speed_10m_max?.[0] != null ? Math.round(d.wind_speed_10m_max[0]) : null,
        };
      } else {
        this.logger.warn(`Open-Meteo no devolvió pronóstico (${res.status}${data?.reason ? `: ${data.reason}` : ''})`);
      }
    } catch (error) {
      this.logger.warn(`No se pudo consultar el clima: ${(error as Error).message}`);
    }

    // Las fallas no se cachean, para reintentar en la próxima consulta
    if (value) this.cache.set(cacheKey, { at: Date.now(), value });
    return value;
  }
}
