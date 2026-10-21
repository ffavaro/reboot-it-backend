/**
 * Quita de una respuesta los datos privados del transportista (DNI/CUIT, dirección, teléfono, foto y vencimiento del
 * carnet, etc.). Se usa cuando quien consulta es un donante: ve quién retira (nombre y vehículo), no sus datos personales.
 * Modifica y devuelve el mismo objeto.
 */
const CAMPOS_PRIVADOS_EMPLEADO = ['cuitDni', 'direccion', 'telefono', 'fechaAlta', 'fotoUrl', 'tieneCarnet', 'cargo', 'usuarioId'];

export function ocultarDatosPrivadosDelTransportista<T>(valor: T): T {
  const recorrer = (v: unknown) => {
    if (Array.isArray(v)) {
      v.forEach(recorrer);
    } else if (v && typeof v === 'object' && !(v instanceof Date)) {
      const o = v as Record<string, unknown>;
      // ficha de transportista
      if ('carnetUrl' in o) {
        delete o.carnetUrl;
        delete o.carnetVencimiento;
      }
      // empleado (o dato de persona con DNI y apellido)
      if ('cuitDni' in o && 'apellido' in o) CAMPOS_PRIVADOS_EMPLEADO.forEach((c) => delete o[c]);
      Object.values(o).forEach(recorrer);
    }
  };
  recorrer(valor);
  return valor;
}
