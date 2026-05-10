import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LogAcceso } from './logacceso.entity';
import { CreateLogAccesoDto } from './dto/create-logacceso.dto';

@Injectable()
export class LogAccesoService {
  constructor(
    @InjectRepository(LogAcceso)
    private readonly logRepository: Repository<LogAcceso>,
  ) {}

  create(dto: CreateLogAccesoDto) {
    const log = this.logRepository.create({ ...dto, fechaHora: new Date() });
    return this.logRepository.save(log);
  }

  findAll() {
    return this.logRepository.find({
      relations: ['usuario'],
      order: { fechaHora: 'DESC' },
    });
  }

  findByUsuario(usuarioId: number) {
    return this.logRepository.find({
      where: { usuarioId },
      order: { fechaHora: 'DESC' },
    });
  }
}
