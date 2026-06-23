import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity()
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ default: false })
  read: boolean; // ¿Ya la leyó el usuario?

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User)
  user: User;

  @Column()
  userId: string;
}