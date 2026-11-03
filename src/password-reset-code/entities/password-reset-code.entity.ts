import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Usuario } from '../../usuarios/usuario.entity';

@Entity('password_reset_codes')
export class PasswordResetCode {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id', type: 'int' })
  userId: number;

  @Column({ name: 'code_hash', type: 'varchar', length: 255 })
  codeHash: string;

  @Column({ name: 'expires_at', type: 'datetime' })
  expiresAt: Date;

  @Column({ type: 'int', default: 0 })
  attempts: number;

  @Column({ name: 'used_at', type: 'datetime', nullable: true })
  usedAt: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'datetime', precision: 6 })
  createdAt: Date;

  @Column({ name: 'request_ip', type: 'varchar', length: 45, nullable: true })
  requestIp: string | null;

  @ManyToOne(() => Usuario, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  usuario: Usuario;
}