import { IsEnum, IsNotEmpty } from 'class-validator';
import { LoanStatus } from '../entities/loan.entity';

export class UpdateLoanStatusDto {
  @IsEnum(LoanStatus, {
    message: 'El estado debe ser: pending, approved, rejected, active o returned',
  })
  @IsNotEmpty()
  status: LoanStatus;
}