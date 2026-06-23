import { Tool } from '../../tools/entities/tool.entity';
import { User } from '../../users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum LoanStatus {
  PENDING = 'pending',    
  APPROVED = 'approved',  
  REJECTED = 'rejected',   
  ACTIVE = 'active',       
  RETURNED = 'returned',   
}

@Entity()
export class Loan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Tool, { eager: true }) 
  tool: Tool;
  @Column()
  toolId: string;

  @ManyToOne(() => User, { eager: true })
  owner: User;
  @Column()
  ownerId: string;

  @ManyToOne(() => User, { eager: true }) 
  requester: User;
  @Column()
  requesterId: string;

  @Column({
    type: 'varchar',
    length: 20,
    enum: LoanStatus, 
    default: LoanStatus.PENDING,
  })
  status: LoanStatus;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date' }) 
  endDate: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}