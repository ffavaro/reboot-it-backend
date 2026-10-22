# Decisiones de diseño

## Hoja de ruta: kilómetros finales
Al confirmar el último retiro, la hoja de ruta se cierra con los **km estimados por Google** (ida y vuelta desde la base).
El sistema no registra el odómetro real al terminar, por lo que el km final del historial del vehículo es un valor estimado.
Si se necesita el real, habría que pedirle al transportista el kilometraje al cerrar la hoja.

## Recuperar contraseña
El enlace "¿Olvidaste tu contraseña?" está oculto: el backend no envía correos ni guarda tokens de recuperación.
Hoy la contraseña la restablece el Administrativo/SysAdmin desde Usuarios.

## Finalizar procesos de destrucción
El Técnico y el Administrativo (y el SysAdmin) inician y finalizan los procesos de destrucción: no hay doble control por rol. Para finalizar el proceso tiene que tener método y responsable ("Iniciar").
El certificado de disposición no se emite mientras el lote tenga procesos abiertos y solo hay un certificado activo por lote; al emitirlo la donación pasa a Finalizada.
