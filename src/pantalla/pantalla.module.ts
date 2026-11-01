import { Module } from '@nestjs/common';
import { PantallaService } from './pantalla.service';
import { PantallaController } from './pantalla.controller';

@Module({
  controllers: [PantallaController],
  providers: [PantallaService],
})
export class PantallaModule {}
