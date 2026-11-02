import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PasswordResetCodeService } from './password-reset-code.service';
import { CreatePasswordResetCodeDto } from './dto/create-password-reset-code.dto';
import { UpdatePasswordResetCodeDto } from './dto/update-password-reset-code.dto';

@Controller('password-reset-code')
export class PasswordResetCodeController {
  constructor(private readonly passwordResetCodeService: PasswordResetCodeService) {}

  @Post()
  create(@Body() createPasswordResetCodeDto: CreatePasswordResetCodeDto) {
    return this.passwordResetCodeService.create(createPasswordResetCodeDto);
  }

  @Get()
  findAll() {
    return this.passwordResetCodeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.passwordResetCodeService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePasswordResetCodeDto: UpdatePasswordResetCodeDto) {
    return this.passwordResetCodeService.update(+id, updatePasswordResetCodeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.passwordResetCodeService.remove(+id);
  }
}
