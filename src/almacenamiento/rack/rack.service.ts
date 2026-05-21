import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rack } from './rack.entity';
import { CreateRackDto } from './dto/create-rack.dto';
import { UpdateRackDto } from './dto/update-rack.dto';

@Injectable()
export class RackService {
  constructor(
    @InjectRepository(Rack)
    private readonly rackRepository: Repository<Rack>,
  ) {}

  create(dto: CreateRackDto) {
    const rack = this.rackRepository.create(dto);
    return this.rackRepository.save(rack);
  }

  findAll() {
    return this.rackRepository.find({ where: { isActive: true } });
  }

  async findOne(id: number) {
    const rack = await this.rackRepository.findOne({ where: { id } });
    if (!rack) throw new NotFoundException(`Rack ${id} no encontrado`);
    return rack;
  }

  async update(id: number, dto: UpdateRackDto) {
    await this.findOne(id);
    await this.rackRepository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.rackRepository.update(id, { isActive: false });
    return { message: 'Rack desactivado' };
  }
}
