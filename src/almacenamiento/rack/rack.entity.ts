import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('rack')
export class Rack {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50 })
  codigo: string;

  @Column({ length: 150, nullable: true })
  ubicacion: string;

  @Column({ name: 'is_active', type: 'tinyint', default: 1 })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
