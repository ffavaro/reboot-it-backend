import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmpleadoTransportista } from './empleado-transportista.entity';
import { EmpleadoTransportistaController } from './empleado-transportista.controller';
import { EmpleadoTransportistaService } from './empleado-transportista.service';

@Module({
  imports: [TypeOrmModule.forFeature([EmpleadoTransportista])],
  controllers: [EmpleadoTransportistaController],
  providers: [EmpleadoTransportistaService],
  exports: [EmpleadoTransportistaService],
})
export class EmpleadoTransportistaModule {}
