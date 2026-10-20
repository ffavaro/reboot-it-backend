import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Rol } from '../roles/rol.entity';

@Entity('empleado')
export class Empleado {
  @PrimaryGeneratedColumn()
  id: number;


  @Column({ name: 'rol_id' })
  rolId: number;

  @Column({ length: 100 })
  nombre: string;

  @Column({ length: 100 })
  apellido: string;

  @Column({ name: 'cuit_dni', length: 11, unique: true, nullable: true })
  cuitDni: string;

  @Column({ name: 'fecha_alta', type: 'date', nullable: true })
  fechaAlta: string;

  @Column({ length: 255, nullable: true })
  direccion: string;

  @Column({ length: 20, nullable: true })
  telefono: string;

  @Column({ length: 100, nullable: true })
  cargo: string;

  // Tiene carnet de conducir: condición para poder ser transportista
  @Column({ name: 'tiene_carnet', type: 'tinyint', default: 0 })
  tieneCarnet: boolean;

  // Foto tipo carnet del empleado (opcional)
  @Column({ name: 'foto_url', type: 'varchar', length: 255, nullable: true })
  fotoUrl: string | null;

  @Column({ name: 'is_active', type: 'tinyint', default: 1 })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Rol)
  @JoinColumn({ name: 'rol_id' })
  rol: Rol;
}
