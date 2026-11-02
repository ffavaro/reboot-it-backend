import { PartialType } from '@nestjs/swagger';
import { CreatePasswordResetCodeDto } from './create-password-reset-code.dto';

export class UpdatePasswordResetCodeDto extends PartialType(CreatePasswordResetCodeDto) {}
