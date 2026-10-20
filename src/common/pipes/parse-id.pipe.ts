import { BadRequestException, ParseIntPipe } from '@nestjs/common';

// ParseIntPipe con el mensaje en español
export const ParseIdPipe = new ParseIntPipe({
  exceptionFactory: () => new BadRequestException('El identificador debe ser un número entero'),
});
