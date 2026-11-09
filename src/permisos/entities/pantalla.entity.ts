import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity('pantalla')
export class Pantalla {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50, unique: true })
  clave: string;

  @Column({ length: 100 })
  nombre: string;

  @Column({ length: 100 })
  seccion: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  ruta: string | null;

  @Column({ type: 'int', default: 0 })
  orden: number;

  @Column({ name: 'is_active', type: 'tinyint', default: 1 })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
