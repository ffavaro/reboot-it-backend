import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConstanciaRetiro } from './constancia-retiro.entity';
import { ConstanciaRetiroController } from './constancia-retiro.controller';
import { ConstanciaRetiroService } from './constancia-retiro.service';

@Module({
  imports: [TypeOrmModule.forFeature([ConstanciaRetiro])],
  controllers: [ConstanciaRetiroController],
  providers: [ConstanciaRetiroService],
  exports: [ConstanciaRetiroService],
})
export class ConstanciaRetiroModule {}
