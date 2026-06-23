import { IsNotEmpty, IsString, IsUUID, IsDateString } from 'class-validator';

export class CreateLoanDto {
  @IsUUID()
  @IsNotEmpty()
  toolId: string; 

  @IsDateString() 
  @IsNotEmpty()
  startDate: Date;

  @IsDateString()
  @IsNotEmpty()
  endDate: Date;
}