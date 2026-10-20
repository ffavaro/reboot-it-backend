import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { Empleado } from './empleado.entity';
import { CreateEmpleadoDto } from './dto/create-empleado.dto';
import { UpdateEmpleadoDto } from './dto/update-empleado.dto';

@Injectable()
export class EmpleadosService {
  constructor(
    @InjectRepository(Empleado)
    private readonly empleadoRepository: Repository<Empleado>,
  ) {}

  // Incluye empleados inactivos, porque el índice único de la base también los cuenta
  private async assertCuitDniUnico(cuitDni?: string, excludeId?: number) {
    if (!cuitDni) return;
    const idFilter = excludeId ? { id: Not(excludeId) } : {};
    if (await this.empleadoRepository.exists({ where: { cuitDni, ...idFilter } })) {
      throw new ConflictException('El CUIT/DNI ya está registrado en otro empleado');
    }
  }

  async create(dto: CreateEmpleadoDto) {
    await this.assertCuitDniUnico(dto.cuitDni);
    const empleado = this.empleadoRepository.create(dto);
    return this.empleadoRepository.save(empleado);
  }

  findAll() {
    return this.empleadoRepository.find({
      where: { isActive: true },
      relations: ['rol'],
    });
  }

  async findOne(id: number) {
    const empleado = await this.empleadoRepository.findOne({
      where: { id },
      relations: ['rol'],
    });
    if (!empleado) throw new NotFoundException(`Empleado ${id} no encontrado`);
    return empleado;
  }

  async update(id: number, dto: UpdateEmpleadoDto) {
    await this.findOne(id);
    await this.assertCuitDniUnico(dto.cuitDni, id);
    await this.empleadoRepository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.empleadoRepository.update(id, { isActive: false });
    return { message: 'Empleado desactivado' };
  }
}
