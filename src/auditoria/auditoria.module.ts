import { Global, Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LogAcceso } from './log-acceso.entity';
import { AuditoriaService } from './auditoria.service';
import { AuditoriaInterceptor } from './auditoria.interceptor';
import { AuditoriaController } from './auditoria.controller';

// Global: los guards y AuthService (módulo auth) también registran eventos
@Global()
@Module({
  imports: [TypeOrmModule.forFeature([LogAcceso])],
  controllers: [AuditoriaController],
  providers: [AuditoriaService, { provide: APP_INTERCEPTOR, useClass: AuditoriaInterceptor }],
  exports: [AuditoriaService],
})
export class AuditoriaModule {}
