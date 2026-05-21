import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Usuario } from '../usuarios/usuario.entity';

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

  @Column({ length: 45, nullable: true })
  ip: string;

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
