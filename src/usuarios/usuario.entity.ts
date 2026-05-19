import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Rol } from '../roles/rol.entity';
import { Empleado } from '../empleados/empleado.entity';

@Entity('usuario')
export class Usuario {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  nombre: string;

  @Column({ length: 150, unique: true })
  email: string;

  @Column({ length: 255 })
  password: string;

  @Column({ name: 'rol_id' })
  rolId: number;

  @Column({ name: 'empleado_id', nullable: true })
  empleadoId: number;

  @Column({ name: 'cuit_dni', length: 20, unique: true, nullable: true })
  cuitDni: string;

  @Column({ name: 'is_active', type: 'tinyint', default: 1 })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Rol)
  @JoinColumn({ name: 'rol_id' })
  rol: Rol;

  @OneToOne(() => Empleado)
  @JoinColumn({ name: 'empleado_id' })
  empleado: Empleado;
}
