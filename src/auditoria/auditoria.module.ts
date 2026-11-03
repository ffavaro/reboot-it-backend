import { Global, Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditoriaController } from './auditoria.controller';
import { AuditoriaInterceptor } from './auditoria.interceptor';
import { AuditoriaService } from './auditoria.service';
import { LogAcceso } from './entities/auditoria.entity';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([LogAcceso])],
  controllers: [AuditoriaController],
  providers: [
    AuditoriaService,
    { provide: APP_INTERCEPTOR, useClass: AuditoriaInterceptor },
  ],
  exports: [AuditoriaService],
})
export class AuditoriaModule {}
