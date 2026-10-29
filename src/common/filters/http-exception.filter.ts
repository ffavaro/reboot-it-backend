import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Response } from 'express';
import { QueryFailedError } from 'typeorm';

// Los errores de listas anidadas llegan como "detalles.0.mensaje": al usuario se le muestra solo el mensaje
const PREFIJO_ANIDADO = /^(?:[A-Za-z]+.[0-9]+.)+/;

// Errores de MySQL que son culpa de los datos enviados, no del servidor
function traducirErrorDeBase(exception: unknown): { status: number; message: string } | null {
  if (!(exception instanceof QueryFailedError)) return null;
  const driver = exception.driverError as { errno?: number; sqlMessage?: string } | undefined;
  switch (driver?.errno) {
    case 1452: {
      // "... REFERENCES `gestor_ambiental` (`id`)": se nombra la tabla que no tiene ese registro
      const tabla = /REFERENCES `([a-z_0-9]+)`/i.exec(driver.sqlMessage ?? '')?.[1];
      return {
        status: HttpStatus.BAD_REQUEST,
        message: tabla
          ? `El registro seleccionado no existe (${tabla.replace(/_/g, ' ')}).`
          : 'Alguno de los registros seleccionados no existe.',
      };
    }
    case 1451:
      return { status: HttpStatus.CONFLICT, message: 'No se puede eliminar: el registro está en uso.' };
    case 1062:
      return { status: HttpStatus.CONFLICT, message: 'Ya existe un registro con esos datos.' };
    case 1264:
    case 1406:
      return { status: HttpStatus.BAD_REQUEST, message: 'Alguno de los valores ingresados es demasiado grande.' };
    default:
      return null;
  }
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const deBase = traducirErrorDeBase(exception);
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : (deBase?.status ?? HttpStatus.INTERNAL_SERVER_ERROR);

    if (!(exception instanceof HttpException) && !deBase) {
      this.logger.error(exception instanceof Error ? exception.stack : String(exception));
    }

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : (deBase?.message ?? 'Error interno del servidor');

    if (typeof message === 'object' && Array.isArray((message as { message?: unknown }).message)) {
      const m = message as { message: unknown[] };
      m.message = m.message.map((x) => (typeof x === 'string' ? x.replace(PREFIJO_ANIDADO, '') : x));
    }

    response.status(status).json(
      typeof message === 'object'
        ? { statusCode: status, ...message as object }
        : { statusCode: status, message },
    );
  }
}
