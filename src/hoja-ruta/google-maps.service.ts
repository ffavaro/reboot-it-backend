import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

// Un punto del recorrido, en el orden en que se visita. indice = posición en las direcciones
// recibidas (null para la base). direccion es el texto exacto que se envía a Google.
export interface PuntoRuta {
  rol: 'origen' | 'parada' | 'destino';
  indice: number | null;
  direccion: string;
}

// Datos para dibujar la ruta en un mapa propio: línea del recorrido (polyline codificada de Google) y la
// coordenada de cada punto del recorrido, en el mismo orden que `puntos`
export interface MapaRuta {
  polyline: string;
  puntos: { lat: number; lng: number }[];
}

export interface RutaCalculada {
  // Índices de las direcciones recibidas, en el orden de visita recomendado
  orden: number[];
  kmEstimados: number | null;
  // Tiempo de manejo estimado del recorrido completo, sin contar el tiempo en cada parada
  duracionMinutos: number | null;
  mapsUrl: string | null;
  // URL para mostrar la ruta en un iframe (mapa embebido)
  embedUrl: string | null;
  // Ruta lista para dibujar (null si Google no la calculó)
  mapa: MapaRuta | null;
  // Punto de partida/llegada configurado (HOJA_RUTA_ORIGEN), si hay
  origen: string | null;
  // Recorrido completo: origen, paradas intermedias y destino
  puntos: PuntoRuta[];
  optimizada: boolean;
  advertencia?: string;
}

const ROUTES_URL = 'https://routes.googleapis.com/directions/v2:computeRoutes';
// La Routes API admite hasta 25 paradas intermedias por consulta
const MAX_WAYPOINTS = 25;
const CACHE_TTL_MS = 15 * 60 * 1000;
const TIMEOUT_MS = 8000;
// Una ruta local de retiros por encima de esto casi seguro tiene una dirección mal resuelta
const KM_ALERTA_DEFAULT = 300;

const sinAcentos = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

@Injectable()
export class GoogleMapsService {
  private readonly logger = new Logger(GoogleMapsService.name);
  private readonly cache = new Map<string, { at: number; value: RutaCalculada }>();

  constructor(private readonly config: ConfigService) {}

  // Localidad por defecto: HOJA_RUTA_CIUDAD o, si no, los dos últimos tramos de la base
  // ("Haedo 858, Barrio Alto Alberdi, Córdoba, Argentina" -> "Córdoba, Argentina")
  private ciudadPorDefecto(base: string): string {
    const configurada = this.config.get<string>('HOJA_RUTA_CIUDAD')?.trim();
    if (configurada) return configurada;
    const partes = base.split(',').map((p) => p.trim()).filter(Boolean);
    return partes.length >= 3 ? partes.slice(-2).join(', ') : '';
  }

  // Las direcciones de los donantes suelen venir sin ciudad ("Chacabuco 280"): Google las busca
  // en todo el país y puede resolver otra ciudad. Se les agrega la localidad de la base.
  private completarDireccion(direccion: string, ciudad: string): string {
    const d = direccion.trim();
    if (!d || !ciudad) return d;
    const localidad = sinAcentos(ciudad.split(',')[0].trim());
    return sinAcentos(d).includes(localidad) ? d : `${d}, ${ciudad}`;
  }

  private buildMapsUrl(waypoints: string[], destination: string): string {
    // Sin origin, Google Maps parte de la ubicación actual del dispositivo
    const params = new URLSearchParams({ api: '1', destination, travelmode: 'driving' });
    if (waypoints.length) params.set('waypoints', waypoints.join('|'));
    return `https://www.google.com/maps/dir/?${params.toString()}`;
  }

  // Mapa embebido: con GOOGLE_MAPS_EMBED_API_KEY usa la Maps Embed API (directions/place);
  // sin ella, el embed clásico de Google Maps, que no requiere key
  private buildEmbedUrl(origin: string, waypoints: string[], destination: string, embedKey: string): string {
    if (embedKey) {
      if (origin === destination && !waypoints.length) {
        return `https://www.google.com/maps/embed/v1/place?${new URLSearchParams({ key: embedKey, q: destination, language: 'es', region: 'ar' })}`;
      }
      const params = new URLSearchParams({ key: embedKey, origin, destination, mode: 'driving', language: 'es', region: 'ar' });
      if (waypoints.length) params.set('waypoints', waypoints.join('|'));
      return `https://www.google.com/maps/embed/v1/directions?${params.toString()}`;
    }
    const params = new URLSearchParams({ output: 'embed', hl: 'es', saddr: origin, daddr: [...waypoints, destination].join(' to:') });
    return `https://maps.google.com/maps?${params.toString()}`;
  }

  /**
   * Ordena las paradas de forma óptima y estima los km totales con la Routes API de Google.
   * Si HOJA_RUTA_ORIGEN está configurada, la ruta sale y vuelve a esa base; si no, va de la
   * primera a la última parada. Sin GOOGLE_MAPS_API_KEY se mantiene el orden cronológico y no
   * hay estimación de km (el link de Google Maps se genera igual).
   */
  async calcular(direcciones: string[]): Promise<RutaCalculada> {
    const base = this.config.get<string>('HOJA_RUTA_ORIGEN')?.trim() || '';
    const key = this.config.get<string>('GOOGLE_MAPS_API_KEY')?.trim() || '';
    const embedKey = this.config.get<string>('GOOGLE_MAPS_EMBED_API_KEY')?.trim() || '';

    const ciudad = this.ciudadPorDefecto(base);
    const completas = direcciones.map((d) => this.completarDireccion(d, ciudad));

    const cacheKey = JSON.stringify([base, completas, !!embedKey]);
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.at < CACHE_TTL_MS) return cached.value;

    const value = await this.calcularSinCache(completas, base, key, embedKey);
    // No se cachean las fallas de Google, para reintentar en la próxima consulta
    if (!value.advertencia || value.kmEstimados !== null) this.cache.set(cacheKey, { at: Date.now(), value });
    return value;
  }

  private async calcularSinCache(direcciones: string[], base: string, key: string, embedKey: string): Promise<RutaCalculada> {
    const validas = direcciones.map((d, i) => ({ d: d.trim(), i })).filter((x) => x.d);
    const sinDireccion = direcciones.map((_, i) => i).filter((i) => !direcciones[i].trim());

    if (validas.length === 0) {
      return {
        orden: sinDireccion, kmEstimados: null, duracionMinutos: null, mapsUrl: null, embedUrl: null, mapa: null, origen: base || null, puntos: [], optimizada: false,
        advertencia: 'Ninguna parada tiene dirección cargada',
      };
    }

    // Con base: sale y vuelve a la base pasando por todas las paradas.
    // Sin base: de la primera a la última parada, optimizando las intermedias.
    const conBase = !!base;
    const extremos = conBase ? [] : [validas[0], validas[validas.length - 1]];
    const intermedias = conBase ? validas : validas.slice(1, -1);
    const origin = conBase ? base : validas[0].d;
    const destination = conBase ? base : validas[validas.length - 1].d;

    let ordenIntermedias = intermedias.map((x) => x.i);
    let kmEstimados: number | null = null;
    let duracionMinutos: number | null = null;
    let optimizada = false;
    let advertencia: string | undefined;
    let mapa: MapaRuta | null = null;

    const puedeCalcular = conBase || validas.length >= 2;
    if (!puedeCalcular) {
      advertencia = 'Con una sola parada y sin base configurada (HOJA_RUTA_ORIGEN) no se pueden estimar los km';
    } else if (!key) {
      advertencia = 'Estimación de km no disponible: falta configurar GOOGLE_MAPS_API_KEY';
    } else if (intermedias.length > MAX_WAYPOINTS) {
      advertencia = `Se superó el máximo de ${MAX_WAYPOINTS} paradas por ruta: no se pudo optimizar`;
    } else {
      try {
        // Routes API (reemplaza a la Directions API legacy, que Google ya no habilita en proyectos nuevos)
        const body = {
          origin: { address: origin },
          destination: { address: destination },
          ...(intermedias.length ? { intermediates: intermedias.map((x) => ({ address: x.d })) } : {}),
          travelMode: 'DRIVE',
          ...(intermedias.length > 1 ? { optimizeWaypointOrder: true } : {}),
          languageCode: 'es-AR',
          regionCode: 'AR',
          units: 'METRIC',
        };
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
        const res = await fetch(ROUTES_URL, {
          method: 'POST',
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': key,
            'X-Goog-FieldMask': 'routes.distanceMeters,routes.duration,routes.optimizedIntermediateWaypointIndex,routes.polyline.encodedPolyline,routes.legs.startLocation,routes.legs.endLocation',
          },
          body: JSON.stringify(body),
        }).finally(() => clearTimeout(timer));
        const data: any = await res.json();

        const route = data.routes?.[0];
        if (res.ok && route && typeof route.distanceMeters === 'number') {
          kmEstimados = Math.round((route.distanceMeters / 1000) * 100) / 100;
          // La duración llega como texto en segundos ("1234s")
          const segundos = parseFloat(String(route.duration ?? ''));
          if (Number.isFinite(segundos)) duracionMinutos = Math.max(1, Math.round(segundos / 60));
          const kmAlerta =Number(this.config.get<string>('HOJA_RUTA_KM_ALERTA')) || KM_ALERTA_DEFAULT;
          if (kmEstimados > kmAlerta) {
            advertencia = `La distancia estimada (${kmEstimados} km) es muy alta para una ruta local: revisá que las direcciones tengan calle, número y ciudad correctos`;
          }
          // Línea y coordenadas para dibujar el recorrido: origen, cada parada y destino (un tramo por parada)
          const legs: any[] = route.legs ?? [];
          const coordenada = (loc: any) => (loc?.latLng ? { lat: Number(loc.latLng.latitude), lng: Number(loc.latLng.longitude) } : null);
          const puntosMapa = legs.length ? [coordenada(legs[0].startLocation), ...legs.map((l) => coordenada(l.endLocation))] : [];
          if (route.polyline?.encodedPolyline && puntosMapa.length && puntosMapa.every((p) => p !== null)) {
            mapa = { polyline: route.polyline.encodedPolyline, puntos: puntosMapa as { lat: number; lng: number }[] };
          }
          const wpOrder: number[] | undefined = route.optimizedIntermediateWaypointIndex;
          if (wpOrder?.length === intermedias.length && intermedias.length > 1) {
            ordenIntermedias = wpOrder.map((idx) => intermedias[idx].i);
            optimizada = true;
          }
        } else if (res.ok) {
          advertencia = 'Google Maps no encontró una ruta entre las direcciones cargadas: revisá que estén completas';
          this.logger.warn(advertencia);
        } else {
          const err = data.error ?? {};
          advertencia = `Google Maps no pudo calcular la ruta (${err.status ?? res.status}${err.message ? `: ${err.message}` : ''})`;
          this.logger.warn(advertencia);
        }
      } catch (error) {
        advertencia = 'No se pudo consultar Google Maps para estimar la ruta';
        this.logger.warn(`${advertencia}: ${(error as Error).message}`);
      }
    }

    const ordenValidas = conBase
      ? ordenIntermedias
      : [extremos[0].i, ...ordenIntermedias, ...(validas.length > 1 ? [extremos[1].i] : [])];
    const direccionDe = (i: number) => direcciones[i].trim();

    const mapsUrl = conBase
      ? this.buildMapsUrl(ordenValidas.map(direccionDe), base)
      : this.buildMapsUrl(ordenValidas.slice(0, -1).map(direccionDe), direccionDe(ordenValidas[ordenValidas.length - 1]));

    const embedUrl = conBase
      ? this.buildEmbedUrl(base, ordenValidas.map(direccionDe), base, embedKey)
      : this.buildEmbedUrl(
          direccionDe(ordenValidas[0]),
          ordenValidas.slice(1, -1).map(direccionDe),
          direccionDe(ordenValidas[ordenValidas.length - 1]),
          embedKey,
        );

    const puntos: PuntoRuta[] = conBase
      ? [
          { rol: 'origen', indice: null, direccion: base },
          ...ordenValidas.map((i): PuntoRuta => ({ rol: 'parada', indice: i, direccion: direccionDe(i) })),
          { rol: 'destino', indice: null, direccion: base },
        ]
      : ordenValidas.map((i, pos): PuntoRuta => ({
          rol: ordenValidas.length === 1 || pos === ordenValidas.length - 1 ? 'destino' : pos === 0 ? 'origen' : 'parada',
          indice: i,
          direccion: direccionDe(i),
        }));

    return { orden: [...ordenValidas, ...sinDireccion], kmEstimados, duracionMinutos, mapsUrl, embedUrl, mapa, origen: base || null, puntos, optimizada, advertencia };
  }
}
