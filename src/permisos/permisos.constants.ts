
export const ACCIONES = ["ver", "crear", "editar","baja"] as const;

export type Accion = (typeof ACCIONES)[number];

export const ALCANCES = ["TODOS", "EN_PLANTA", "ASIGNADOS", "PROPIOS"] as const;

export type Alcance = (typeof ALCANCES)[number];

export const AMPLITUD : Record<Alcance, number> = {
    TODOS: 3,
    EN_PLANTA: 2,
    ASIGNADOS: 1,
    PROPIOS: 1
}

export type PermisoPantalla = Record<Accion, boolean> & { alcance : Alcance};

export const SIN_PERMISOS: PermisoPantalla = {
  ver: false,
  crear: false,
  editar: false,
  baja: false,
  alcance: 'TODOS',
};

export const ACCION_POR_METODO: Record<string, Accion> = {
     GET: 'ver',
  HEAD: 'ver',
  POST: 'crear',
  PUT: 'editar',
  PATCH: 'editar',
  DELETE: 'baja',
}

export const ROL = {
    ADMIN: 'ADMIN',
    ADMINISTRATIVO: "ADMINISTRATIVO",
    TECNICO: "TECNICO",
    TRANSPORTISTA: "TRANSPORTISTA",
    DONANTE: "DONANTE"
} as const;
export type CodigoRol = (typeof ROL)[keyof typeof ROL]

export type PermisosPorClave = Map<string, PermisoPantalla>;

export const VIGENCIA_CACHE_MS = 30_000;