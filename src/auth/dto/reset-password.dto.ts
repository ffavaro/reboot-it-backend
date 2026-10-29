import { Transform } from 'class-transformer';
import {
  IsEmail, IsNotEmpty, IsString, Matches, MaxLength, MinLength, registerDecorator, ValidationArguments, ValidationOptions,
} from 'class-validator';

// confirmPassword tiene que coincidir con otro campo del mismo DTO
function CoincideCon(campo: string, options?: ValidationOptions) {
  return (object: object, propertyName: string) => {
    registerDecorator({
      name: 'coincideCon',
      target: object.constructor,
      propertyName,
      constraints: [campo],
      options,
      validator: {
        validate(value: unknown, args: ValidationArguments) {
          return value === (args.object as Record<string, unknown>)[args.constraints[0]];
        },
      },
    });
  };
}

export class ResetPasswordDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  @IsEmail({}, { message: 'Ingresá un email válido' })
  @IsNotEmpty({ message: 'El email es obligatorio' })
  email: string;

  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @Matches(/^\d{6}$/, { message: 'El código tiene que ser de 6 dígitos' })
  code: string;

  @IsString({ message: 'La contraseña nueva es obligatoria' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @Matches(/[A-Z]/, { message: 'La contraseña debe tener al menos una mayúscula' })
  @Matches(/[a-z]/, { message: 'La contraseña debe tener al menos una minúscula' })
  @Matches(/\d/, { message: 'La contraseña debe tener al menos un número' })
  @MaxLength(12, { message: 'La contraseña no puede superar los 12 caracteres' })
  newPassword: string;

  @CoincideCon('newPassword', { message: 'Las contraseñas no coinciden' })
  confirmPassword: string;
}
