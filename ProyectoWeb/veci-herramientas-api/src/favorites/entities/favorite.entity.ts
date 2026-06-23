import { Entity, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Tool } from '../../tools/entities/tool.entity';

@Entity()
export class Favorite {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.id, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Tool, (tool) => tool.id, { onDelete: 'CASCADE' })
  tool: Tool;

  @CreateDateColumn()
  createdAt: Date;
}