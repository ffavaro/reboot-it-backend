import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  ValidateBy,
  ValidationOptions,
} from 'class-validator';

const normalizarEmail = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim().toLowerCase() : value;

function IgualA(campo: string, opciones?: ValidationOptions) {
  return ValidateBy(
    {
      name: 'igualA',
      constraints: [campo],
      validator: {
        validate: (valor, args) =>
          valor === (args?.object as Record<string, unknown>)[campo],
      },
    },
    opciones,
  );
}

export class SolicitarCodigoDto {
  @Transform(normalizarEmail)
  @IsNotEmpty({ message: 'El email es obligatorio' })
  @IsEmail({}, { message: 'Ingresá un email válido' })
  email: string;
}

export class RestablecerContrasenaDto {
  @Transform(normalizarEmail)
  @IsNotEmpty({ message: 'El email es obligatorio' })
  @IsEmail({}, { message: 'Ingresá un email válido' })
  email: string;

  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @Matches(/^\d{6}$/, { message: 'El código tiene que ser de 6 dígitos' })
  code: string;

  @IsString({ message: 'La contraseña nueva es obligatoria' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @MaxLength(12, {
    message: 'La contraseña no puede superar los 12 caracteres',
  })
  @Matches(/[A-Z]/, {
    message: 'La contraseña debe tener al menos una mayúscula',
  })
  @Matches(/[a-z]/, {
    message: 'La contraseña debe tener al menos una minúscula',
  })
  @Matches(/\d/, { message: 'La contraseña debe tener al menos un número' })
  newPassword: string;

  @IgualA('newPassword', { message: 'Las contraseñas no coinciden' })
  confirmPassword: string;
}