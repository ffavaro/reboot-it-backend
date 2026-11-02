import { Injectable } from '@nestjs/common';
import { CreateLogaccesoDto } from './dto/create-logacceso.dto';
import { UpdateLogaccesoDto } from './dto/update-logacceso.dto';

@Injectable()
export class LogaccesoService {
  create(createLogaccesoDto: CreateLogaccesoDto) {
    return 'This action adds a new logacceso';
  }

  findAll() {
    return `This action returns all logacceso`;
  }

  findOne(id: number) {
    return `This action returns a #${id} logacceso`;
  }

  update(id: number, updateLogaccesoDto: UpdateLogaccesoDto) {
    return `This action updates a #${id} logacceso`;
  }

  remove(id: number) {
    return `This action removes a #${id} logacceso`;
  }
}
