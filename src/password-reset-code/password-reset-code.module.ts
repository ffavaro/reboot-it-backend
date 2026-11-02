import { Module } from '@nestjs/common';
import { PasswordResetCodeService } from './password-reset-code.service';
import { PasswordResetCodeController } from './password-reset-code.controller';

@Module({
  controllers: [PasswordResetCodeController],
  providers: [PasswordResetCodeService],
})
export class PasswordResetCodeModule {}
