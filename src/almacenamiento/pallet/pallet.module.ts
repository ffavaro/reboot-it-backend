import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pallet } from './pallet.entity';
import { PalletController } from './pallet.controller';
import { PalletService } from './pallet.service';

@Module({
  imports: [TypeOrmModule.forFeature([Pallet])],
  controllers: [PalletController],
  providers: [PalletService],
  exports: [PalletService],
})
export class PalletModule {}
