import { Tool } from '../../tools/entities/tool.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToMany(() => Tool, (tool) => tool.owner)
  tools: Tool[];

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 100, unique: true }) 
  email: string;

  @Column({ type: 'varchar' })
  password: string; 

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({
    type: 'varchar', // 'enum' no es soportado nativamente en mssql, usamos varchar
    default: UserRole.USER,
  })

  role: UserRole;

}