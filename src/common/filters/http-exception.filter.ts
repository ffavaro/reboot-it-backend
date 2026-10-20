import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

// Los errores de listas anidadas llegan como "detalles.0.mensaje": al usuario se le muestra solo el mensaje
const PREFIJO_ANIDADO = /^(?:[A-Za-z]+.[0-9]+.)+/;

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Error interno del servidor';

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
