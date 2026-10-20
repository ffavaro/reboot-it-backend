import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

/**
 * Tabla `pantalla`: catálogo de pantallas sobre las que se asignan permisos (una fila de la matriz).
 * Si se cambia algo acá hay que cambiarlo igual en la tabla (la base corre con synchronize: true).
 */
@Entity('pantalla')
export class Pantalla {
  @PrimaryGeneratedColumn()
  id: number;

  // Identificador estable que usa el código (@Pantalla('donaciones'))
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

  // Reglas de negocio de la pantalla (columna "Notas" de la matriz)
  @Column({ type: 'varchar', length: 500, nullable: true })
  notas: string | null;

  @Column({ name: 'is_active', type: 'tinyint', default: 1 })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
