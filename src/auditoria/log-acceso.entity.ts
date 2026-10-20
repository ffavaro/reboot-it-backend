import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Usuario } from '../usuarios/usuario.entity';

/**
 * Tabla `logacceso`: auditoría del sistema. Mapeo exacto de la tabla en la base:
 *   id int PK · usuario_id int NULL (FK usuario; NULL = anónimo) · fecha_hora datetime ·
 *   accion varchar(100) · resultado varchar(50) · ip varchar(45) · is_active tinyint ·
 *   created_at / updated_at datetime(6) · usuario_intentado varchar(150) · rol varchar(50) ·
 *   metodo varchar(10) · ruta varchar(255) · entidad varchar(100) · entidad_id int ·
 *   codigo_http smallint · user_agent varchar(255)
 *   + índice `usuario_id` (usuario_id, fecha_hora)
 *
 * Si se cambia algo acá hay que cambiarlo igual en la tabla (la base corre con synchronize: true).
 */
@Entity('logacceso')
@Index('usuario_id', ['usuarioId', 'fechaHora'])
export class LogAcceso {
  @PrimaryGeneratedColumn()
  id: number;

  // NULL cuando no hay usuario: request sin token o login de un usuario que no existe
  @Column({ name: 'usuario_id', type: 'int', nullable: true })
  usuarioId: number | null;

  @Column({ name: 'fecha_hora', type: 'datetime' })
  fechaHora: Date;

  // Descripción legible: "Creó retiro", "Finalizó turno", "Inicio de sesión"...
  @Column({ length: 100 })
  accion: string;

  // "Éxito" o "Error"
  @Column({ length: 50 })
  resultado: string;

  @Column({ type: 'varchar', length: 45, nullable: true })
  ip: string | null;

  @Column({ name: 'is_active', type: 'tinyint', default: 1 })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Email usado en un login (sirve cuando el usuario no existe y usuario_id queda en NULL)
  @Column({ name: 'usuario_intentado', type: 'varchar', length: 150, nullable: true })
  usuarioIntentado: string | null;

  // Nombre del rol del usuario al momento de la operación
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

  @ManyToOne(() => Usuario, { nullable: true })
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario | null;
}
