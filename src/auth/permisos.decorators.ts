import { SetMetadata } from '@nestjs/common';
import type { Accion as AccionPermiso } from '../permisos/permisos.constants';

export const PANTALLAS_KEY = 'permisos:pantallas';
export const ACCION_KEY = 'permisos:accion';
export const SOLO_ALCANCE_TOTAL_KEY = 'permisos:solo-alcance-total';

export const Pantalla = (...claves: string[]) => SetMetadata(PANTALLAS_KEY, claves);

export const SoloAutenticado = () => SetMetadata(PANTALLAS_KEY, []);

export const Accion = (accion: AccionPermiso) => SetMetadata(ACCION_KEY, accion);

export const SoloAlcanceTotal = () => SetMetadata(SOLO_ALCANCE_TOTAL_KEY, true);
