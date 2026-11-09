import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { Rol } from '../../roles/rol.entity';
import { ALCANCES } from '../permisos.constants';
import { Pantalla } from './pantalla.entity';
import type { Alcance } from '../permisos.constants';

@Entity('rol_permiso')
@Unique('uq_rol_permiso', ['rolId', 'pantallaId'])
export class RolPermiso {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'rol_id', type: 'int' })
  rolId: number;

  @Column({ name: 'pantalla_id', type: 'int' })
  pantallaId: number;

  @Column({ type: 'boolean', default: false })
  ver: boolean;

  @Column({ type: 'boolean', default: false })
  crear: boolean;

  @Column({ type: 'boolean', default: false })
  editar: boolean;

  @Column({ type: 'boolean', default: false })
  baja: boolean;

  @Column({ type: 'enum', enum: ALCANCES, default: 'TODOS' })
  alcance: Alcance;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Rol, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'rol_id' })
  rol: Rol;

  @ManyToOne(() => Pantalla, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'pantalla_id' })
  pantalla: Pantalla;
}
