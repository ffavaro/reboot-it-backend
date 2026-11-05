import { Injectable } from '@nestjs/common';
import { Coordenada, MapaRuta, ResultadoGoogle } from '../../interfaces/ruta.types';
import { RespuestaGoogle, UbicacionGoogle } from '../../interfaces/geo.types';

const ROUTES_URL = 'https://routes.googleapis.com/directions/v2:computeRoutes';
const TIMEOUT_MS = 8000;
const CAMPOS = [
  'routes.distanceMeters',
  'routes.duration',
  'routes.optimizedIntermediateWaypointIndex',
  'routes.polyline.encodedPolyline',
  'routes.legs.startLocation',
  'routes.legs.endLocation',
].join(',');

export class GoogleRoutesError extends Error {}

@Injectable()
export class GoogleRoutesClient {
  async calcular(
    apiKey: string,
    origen: string,
    destino: string,
    intermedias: string[],
  ): Promise<ResultadoGoogle | null> {
    const body = {
      origin: { address: origen },
      destination: { address: destino },
      travelMode: 'DRIVE',
      languageCode: 'es-AR',
      regionCode: 'AR',
      units: 'METRIC',
      ...(intermedias.length && {
        intermediates: intermedias.map((address) => ({ address })),
      }),
      ...(intermedias.length > 1 && { optimizeWaypointOrder: true }),
    };

    const respuesta = await fetch(ROUTES_URL, {
      method: 'POST',
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': CAMPOS,
      },
      body: JSON.stringify(body),
    });
    const datos = (await respuesta.json()) as RespuestaGoogle;

    if (!respuesta.ok) {
      const { status, message } = datos.error ?? {};
      throw new GoogleRoutesError(
        `${status ?? respuesta.status}${message ? `: ${message}` : ''}`,
      );
    }

    const ruta = datos.routes?.[0];
    if (!ruta || typeof ruta.distanceMeters !== 'number') return null;

    const segundos = parseFloat(ruta.duration ?? '');
    const orden = ruta.optimizedIntermediateWaypointIndex;

    return {
      km: Math.round(ruta.distanceMeters / 10) / 100,
      minutos: Number.isFinite(segundos)
        ? Math.max(1, Math.round(segundos / 60))
        : null,
      mapa: this.armarMapa(ruta.polyline?.encodedPolyline, ruta.legs ?? []),
      ordenIntermedias:
        orden?.length === intermedias.length && intermedias.length > 1
          ? orden
          : null,
    };
  }

  private armarMapa(
    polyline: string | undefined,
    tramos: Array<{
      startLocation?: UbicacionGoogle;
      endLocation?: UbicacionGoogle;
    }>,
  ): MapaRuta | null {
    if (!polyline || !tramos.length) return null;
    const puntos = [
      tramos[0].startLocation,
      ...tramos.map((t) => t.endLocation),
    ].map((u) => this.aCoordenada(u));
    if (puntos.some((p) => p === null)) return null;
    return { polyline, puntos: puntos as Coordenada[] };
  }

  private aCoordenada(ubicacion?: UbicacionGoogle): Coordenada | null {
    if (!ubicacion?.latLng) return null;
    return {
      lat: Number(ubicacion.latLng.latitude),
      lng: Number(ubicacion.latLng.longitude),
    };
  }
}
