import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('gestor_ambiental')
export class GestorAmbiental {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'razon_social', length: 150 })
  razonSocial: string;

  @Column({ length: 20, nullable: true })
  cuit: string;

  @Column({ length: 100, nullable: true })
  habilitacion: string;

  @Column({ length: 100, nullable: true })
  contacto: string;

  @Column({ name: 'is_active', type: 'tinyint', default: 1 })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
