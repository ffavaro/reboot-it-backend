import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Usuario } from '../usuarios/usuario.entity';

/**
 * Tabla `logacceso` tal como existe hoy en la base (mapeo exacto, sin columnas nuevas):
 *   id int PK · usuario_id int NOT NULL (FK usuario) · fecha_hora datetime NOT NULL ·
 *   accion varchar(100) NOT NULL · resultado varchar(50) NOT NULL · ip varchar(45) NULL ·
 *   is_active tinyint · created_at / updated_at datetime(6)
 */
@Entity('logacceso')
export class LogAcceso {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'usuario_id' })
  usuarioId: number;

  @Column({ name: 'fecha_hora', type: 'datetime' })
  fechaHora: Date;

  @Column({ length: 100 })
  accion: string;

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

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;
}
