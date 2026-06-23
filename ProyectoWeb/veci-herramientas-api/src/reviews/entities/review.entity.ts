import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Loan } from '../../loans/entities/loan.entity';

@Entity()
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int' })
  rating: number;

  @Column({ type: 'text', nullable: true })
  comment: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Loan)
  loan: Loan;
  @Column()
  loanId: string;

  @ManyToOne(() => User)
  reviewer: User;
  @Column()
  reviewerId: string;

  @ManyToOne(() => User)
  reviewee: User;
  @Column()
  revieweeId: string;
}