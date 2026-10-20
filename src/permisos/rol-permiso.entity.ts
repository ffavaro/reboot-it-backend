import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Rol } from '../roles/rol.entity';
import { Pantalla } from './pantalla.entity';
import type { Alcance } from './permisos.constants';

/**
 * Tabla `rol_permiso`: permisos de un rol sobre una pantalla (ver / crear / editar / baja) y su alcance.
 * Si se cambia algo acá hay que cambiarlo igual en la tabla (la base corre con synchronize: true).
 */
@Entity('rol_permiso')
@Index('uq_rol_permiso', ['rolId', 'pantallaId'], { unique: true })
export class RolPermiso {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'rol_id', type: 'int' })
  rolId: number;

  @Column({ name: 'pantalla_id', type: 'int' })
  pantallaId: number;

  @Column({ type: 'varchar', length: 10, default: 'NINGUNO' })
  ver: Alcance;

  @Column({ type: 'varchar', length: 10, default: 'NINGUNO' })
  crear: Alcance;

  @Column({ type: 'varchar', length: 10, default: 'NINGUNO' })
  editar: Alcance;

  @Column({ type: 'varchar', length: 10, default: 'NINGUNO' })
  baja: Alcance;

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
