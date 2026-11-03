export const RESULTADO = {
  EXITO: 'Éxito',
  ERROR: 'Error',
} as const;

export type Resultado = (typeof RESULTADO)[keyof typeof RESULTADO];

export interface ContextoRequest {
  ip: string | null;
  userAgent: string | null;
  metodo: string;
  ruta: string;
}

export interface UsuarioAuditado {
  id: number;
  rol?: { nombre?: string } | null;
}

export interface EventoAuditoria extends Partial<ContextoRequest> {
  accion: string;
  resultado: Resultado;
  usuarioId?: number | null;
  rol?: string | null;
  codigoHttp?: number | null;
  entidad?: string | null;
  entidadId?: number | null;
  usuarioIntentado?: string | null;
}
