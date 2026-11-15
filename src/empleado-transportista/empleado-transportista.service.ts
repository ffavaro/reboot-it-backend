import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CrudService } from '@app/common/crud/crud-service';
import { EmpleadoTransportista } from './empleado-transportista.entity';
import { CreateEmpleadoTransportistaDto } from './dto/create-empleado-transportista.dto';
import { UpdateEmpleadoTransportistaDto } from './dto/update-empleado-transportista.dto';

@Injectable()
export class EmpleadoTransportistaService extends CrudService<
  EmpleadoTransportista,
  CreateEmpleadoTransportistaDto,
  UpdateEmpleadoTransportistaDto
> {
  constructor(@InjectRepository(EmpleadoTransportista) repo: Repository<EmpleadoTransportista>) {
    super(repo, {
      etiqueta: 'EmpleadoTransportista', genero: 'm',
      relations: ['empleado', 'vehiculo', 'vehiculo.tipoVehiculo'],
    });
  }
}
