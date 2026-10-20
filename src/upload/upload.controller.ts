import { BadRequestException, Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { Pantalla } from '../auth/auth.decorators';

@ApiTags('upload')
@Controller('upload')
export class UploadController {
  @Pantalla('registro_fotografico', 'turnos', 'constancia_retiro', 'empleado_transportista', 'certificado_disposicion')
  @Post()
  @ApiOperation({ summary: 'Subir una imagen o un PDF' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: join(process.cwd(), 'public', 'uploads'),
        filename: (_req, file, cb) => {
          const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
          cb(null, `${unique}${extname(file.originalname)}`)
        },
      }),
      fileFilter: (_req, file, cb) => {
        if (!/^(image\/(jpg|jpeg|png|gif|webp)|application\/pdf)$/.test(file.mimetype)) {
          return cb(new BadRequestException('Solo se permiten imágenes (jpg, jpeg, png, gif, webp) o archivos PDF'), false)
        }
        cb(null, true)
      },
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  upload(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No se recibió ningún archivo')
    return { url: `/uploads/${file.filename}` }
  }
}
