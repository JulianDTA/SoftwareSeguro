import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity()
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  content: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ default: false })
  isRead: boolean;

  // Emisor
  @ManyToOne(() => User)
  sender: User;
  @Column()
  senderId: string;

  // Receptor
  @ManyToOne(() => User)
  receiver: User;
  @Column()
  receiverId: string;
}