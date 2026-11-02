import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('log_acceso')
export class LogAcceso {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'usuario_id', type: 'int', nullable: true })
  usuarioId: number | null;

  @Column({ name: 'fecha_hora', type: 'datetime' })
  fechaHora: Date;

  @Column({ type: 'varchar', length: 100 })
  accion: string;

  @Column({ type: 'varchar', length: 50 })
  resultado: string;

  @Column({ type: 'varchar', length: 45, nullable: true })
  ip: string | null;

  @Column({ name: 'is_active', type: 'tinyint', width: 1, default: 1 })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'datetime', precision: 6 })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime', precision: 6 })
  updatedAt: Date;

  @Column({ name: 'usuario_intentado', type: 'varchar', length: 150, nullable: true })
  usuarioIntentado: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  rol: string | null;

  @Column({ type: 'varchar', length: 10, nullable: true })
  metodo: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  ruta: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  entidad: string | null;

  @Column({ name: 'entidad_id', type: 'int', nullable: true })
  entidadId: number | null;

  @Column({ name: 'codigo_http', type: 'smallint', nullable: true })
  codigoHttp: number | null;

  @Column({ name: 'user_agent', type: 'varchar', length: 255, nullable: true })
  userAgent: string | null;
}