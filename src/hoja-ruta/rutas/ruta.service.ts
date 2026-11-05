import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleRoutesClient, GoogleRoutesError } from './google-routes.client';
import {
  agregarCiudad,
  ciudadDeLaBase,
  linkEmbebido,
  linkGoogleMaps,
} from './maps-links';
import { MapaRuta, PuntoRuta, RutaCalculada, Configuracion, Parada } from '../../interfaces/ruta.types';
import { CACHE_MS, KM_ALERTA_POR_DEFECTO, MAX_PARADAS_INTERMEDIAS } from '@app/utils/helpers';



@Injectable()
export class RutaService {
  private readonly logger = new Logger(RutaService.name);
  private readonly cache = new Map<
    string,
    { guardado: number; ruta: RutaCalculada }
  >();

  constructor(
    private readonly config: ConfigService,
    private readonly google: GoogleRoutesClient,
  ) {}

  async calcular(direcciones: string[]): Promise<RutaCalculada> {
    const conf = this.leerConfiguracion();
    const ciudad = ciudadDeLaBase(
      conf.base,
      this.config.get<string>('HOJA_RUTA_CIUDAD'),
    );
    const completas = direcciones.map((d) => agregarCiudad(d, ciudad));

    const clave = JSON.stringify([conf.base, completas, !!conf.embedKey]);
    const enCache = this.cache.get(clave);
    if (enCache && Date.now() - enCache.guardado < CACHE_MS)
      return enCache.ruta;

    const ruta = await this.armarRuta(completas, conf);
    if (!ruta.advertencia || ruta.kmEstimados !== null) {
      this.cache.set(clave, { guardado: Date.now(), ruta });
    }
    return ruta;
  }

  private leerConfiguracion(): Configuracion {
    const leer = (nombre: string) =>
      this.config.get<string>(nombre)?.trim() ?? '';
    return {
      base: leer('HOJA_RUTA_ORIGEN'),
      apiKey: leer('GOOGLE_MAPS_API_KEY'),
      embedKey: leer('GOOGLE_MAPS_EMBED_API_KEY'),
      kmAlerta: Number(leer('HOJA_RUTA_KM_ALERTA')) || KM_ALERTA_POR_DEFECTO,
    };
  }

  private async armarRuta(
    direcciones: string[],
    conf: Configuracion,
  ): Promise<RutaCalculada> {
    const paradas: Parada[] = direcciones
      .map((direccion, indice) => ({ direccion: direccion.trim(), indice }))
      .filter((p) => p.direccion);
    const sinDireccion = direcciones
      .map((_, i) => i)
      .filter((i) => !direcciones[i].trim());
    const origen = conf.base || null;

    if (!paradas.length) {
      return {
        orden: sinDireccion,
        kmEstimados: null,
        duracionMinutos: null,
        mapsUrl: null,
        embedUrl: null,
        mapa: null,
        origen,
        puntos: [],
        optimizada: false,
        advertencia: 'Ninguna parada tiene dirección cargada',
      };
    }

    const conBase = !!conf.base;
    const primera = paradas[0];
    const ultima = paradas[paradas.length - 1];
    const intermedias = conBase ? paradas : paradas.slice(1, -1);

    let km: number | null = null;
    let minutos: number | null = null;
    let mapa: MapaRuta | null = null;
    let ordenIntermedias = intermedias.map((p) => p.indice);
    let optimizada = false;
    let advertencia: string | undefined;

    if (!conBase && paradas.length < 2) {
      advertencia =
        'Con una sola parada y sin base configurada (HOJA_RUTA_ORIGEN) no se pueden estimar los km';
    } else if (!conf.apiKey) {
      advertencia =
        'Estimación de km no disponible: falta configurar GOOGLE_MAPS_API_KEY';
    } else if (intermedias.length > MAX_PARADAS_INTERMEDIAS) {
      advertencia = `Se superó el máximo de ${MAX_PARADAS_INTERMEDIAS} paradas por ruta: no se pudo optimizar`;
    } else {
      try {
        const resultado = await this.google.calcular(
          conf.apiKey,
          conBase ? conf.base : primera.direccion,
          conBase ? conf.base : ultima.direccion,
          intermedias.map((p) => p.direccion),
        );
        if (resultado) {
          km = resultado.km;
          minutos = resultado.minutos;
          mapa = resultado.mapa;
          if (resultado.ordenIntermedias) {
            ordenIntermedias = resultado.ordenIntermedias.map(
              (i) => intermedias[i].indice,
            );
            optimizada = true;
          }
          if (km > conf.kmAlerta) {
            advertencia = `La distancia estimada (${km} km) es muy alta para una ruta local: revisá que las direcciones tengan calle, número y ciudad correctos`;
          }
        } else {
          advertencia =
            'Google Maps no encontró una ruta entre las direcciones cargadas: revisá que estén completas';
        }
      } catch (error) {
        advertencia =
          error instanceof GoogleRoutesError
            ? `Google Maps no pudo calcular la ruta (${error.message})`
            : 'No se pudo consultar Google Maps para estimar la ruta';
        this.logger.warn(`${advertencia}: ${(error as Error).message}`);
      }
    }

    const orden = conBase
      ? ordenIntermedias
      : [
          primera.indice,
          ...ordenIntermedias,
          ...(paradas.length > 1 ? [ultima.indice] : []),
        ];

    return {
      orden: [...orden, ...sinDireccion],
      kmEstimados: km,
      duracionMinutos: minutos,
      ...this.armarLinks(
        orden.map((i) => direcciones[i].trim()),
        conf,
      ),
      mapa,
      origen,
      puntos: this.armarPuntos(orden, direcciones, conf.base),
      optimizada,
      advertencia,
    };
  }

  private armarLinks(
    enOrden: string[],
    conf: Configuracion,
  ): { mapsUrl: string; embedUrl: string } {
    if (conf.base) {
      return {
        mapsUrl: linkGoogleMaps(enOrden, conf.base),
        embedUrl: linkEmbebido(conf.base, enOrden, conf.base, conf.embedKey),
      };
    }
    const destino = enOrden[enOrden.length - 1];
    return {
      mapsUrl: linkGoogleMaps(enOrden.slice(0, -1), destino),
      embedUrl: linkEmbebido(
        enOrden[0],
        enOrden.slice(1, -1),
        destino,
        conf.embedKey,
      ),
    };
  }

  private armarPuntos(
    orden: number[],
    direcciones: string[],
    base: string,
  ): PuntoRuta[] {
    const parada = (indice: number): PuntoRuta => ({
      rol: 'parada',
      indice,
      direccion: direcciones[indice].trim(),
    });

    if (base) {
      return [
        { rol: 'origen', indice: null, direccion: base },
        ...orden.map(parada),
        { rol: 'destino', indice: null, direccion: base },
      ];
    }

    return orden.map((indice, pos) => {
      const esUltima = pos === orden.length - 1;
      return {
        ...parada(indice),
        rol: esUltima ? 'destino' : pos === 0 ? 'origen' : 'parada',
      };
    });
  }
}
