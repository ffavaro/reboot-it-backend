import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { LogaccesoService } from './logacceso.service';
import { CreateLogaccesoDto } from './dto/create-logacceso.dto';
import { UpdateLogaccesoDto } from './dto/update-logacceso.dto';

@Controller('logacceso')
export class LogaccesoController {
  constructor(private readonly logaccesoService: LogaccesoService) {}

  @Post()
  create(@Body() createLogaccesoDto: CreateLogaccesoDto) {
    return this.logaccesoService.create(createLogaccesoDto);
  }

  @Get()
  findAll() {
    return this.logaccesoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.logaccesoService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLogaccesoDto: UpdateLogaccesoDto) {
    return this.logaccesoService.update(+id, updateLogaccesoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.logaccesoService.remove(+id);
  }
}
