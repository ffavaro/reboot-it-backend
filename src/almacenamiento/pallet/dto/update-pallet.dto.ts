import { PartialType } from '@nestjs/swagger';
import { CreatePalletDto } from './create-pallet.dto';

export class UpdatePalletDto extends PartialType(CreatePalletDto) {}
