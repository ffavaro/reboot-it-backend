import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pallet } from './pallet.entity';
import { CreatePalletDto } from './dto/create-pallet.dto';
import { UpdatePalletDto } from './dto/update-pallet.dto';

@Injectable()
export class PalletService {
  constructor(
    @InjectRepository(Pallet)
    private readonly palletRepository: Repository<Pallet>,
  ) {}

  create(dto: CreatePalletDto) {
    const pallet = this.palletRepository.create(dto);
    return this.palletRepository.save(pallet);
  }

  findAll() {
    return this.palletRepository.find({
      where: { isActive: true },
      relations: ['rack', 'medioAlmacenamiento'],
    });
  }

  async findOne(id: number) {
    const pallet = await this.palletRepository.findOne({
      where: { id },
      relations: ['rack', 'medioAlmacenamiento'],
    });
    if (!pallet) throw new NotFoundException(`Pallet ${id} no encontrado`);
    return pallet;
  }

  async update(id: number, dto: UpdatePalletDto) {
    await this.findOne(id);
    await this.palletRepository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.palletRepository.update(id, { isActive: false });
    return { message: 'Pallet desactivado' };
  }
}
