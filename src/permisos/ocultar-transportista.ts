const DATOS_PRIVADOS = [
  'telefono',
  'cargo',
  'rolId',
  'rol',
  'usuarioId',
  'email',
  'direccion',
  'cuitDni',
   'carnetUrl',
  'carnetVencimiento',
];

const CLAVES_DEL_TRANSPORTISTA = new Set([
  'empleado',
  'empleadoTransportista',
  'transportista',
]);

function limpiar(valor: unknown, dentroDelTransportista: boolean): void {
  if (Array.isArray(valor)) {
    valor.forEach((v) => limpiar(v, dentroDelTransportista));
    return;
  }
  if (!valor || typeof valor !== 'object' || valor instanceof Date) return;

  const objeto = valor as Record<string, unknown>;
  if (dentroDelTransportista && 'apellido' in objeto) {
    DATOS_PRIVADOS.forEach((campo) => delete objeto[campo]);
  }
  for (const [clave, hijo] of Object.entries(objeto)) {
    limpiar(
      hijo,
      dentroDelTransportista || CLAVES_DEL_TRANSPORTISTA.has(clave),
    );
  }
}

export function ocultarDatosDelTransportista<T>(respuesta: T): T {
  limpiar(respuesta, false);
  return respuesta;
}
