import { Injectable } from '@nestjs/common';
import { CreatePasswordResetCodeDto } from './dto/create-password-reset-code.dto';
import { UpdatePasswordResetCodeDto } from './dto/update-password-reset-code.dto';

@Injectable()
export class PasswordResetCodeService {
  create(createPasswordResetCodeDto: CreatePasswordResetCodeDto) {
    return 'This action adds a new passwordResetCode';
  }

  findAll() {
    return `This action returns all passwordResetCode`;
  }

  findOne(id: number) {
    return `This action returns a #${id} passwordResetCode`;
  }

  update(id: number, updatePasswordResetCodeDto: UpdatePasswordResetCodeDto) {
    return `This action updates a #${id} passwordResetCode`;
  }

  remove(id: number) {
    return `This action removes a #${id} passwordResetCode`;
  }
}
