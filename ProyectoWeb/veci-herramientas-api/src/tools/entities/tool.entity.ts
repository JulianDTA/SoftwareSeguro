import { User } from '../../users/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';

export enum ToolStatus {
  PENDING = 'pending',     // Esperando aprobación del admin
  APPROVED = 'approved',   // Visible en el catálogo
  REJECTED = 'rejected',   // Rechazada por el admin
}

export enum PostType {
  LOAN = 'loan', // Préstamo
  SALE = 'sale', // Venta
}

@Entity()
export class Tool {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 50 })
  category: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.tools)
  owner: User;

  @Column() 
  ownerId: string;
  @Column({
    type: 'varchar',
    default: ToolStatus.PENDING, 
  })
  status: ToolStatus;

  // --- NUEVO: TIPO DE PUBLICACIÓN (Venta o Préstamo) ---
  @Column({
    type: 'varchar',
    default: PostType.LOAN,
  })
  type: PostType;

  // --- NUEVO: PRECIO (Opcional, para ventas) ---
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  price: number;

  @Column({ default: true })
  available: boolean;

}