import { IsString, IsNotEmpty, MaxLength, IsOptional, IsEnum, IsNumber, Min } from 'class-validator';
import { PostType } from '../entities/tool.entity';

export class CreateToolDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  category: string;

  @IsEnum(PostType)
  @IsNotEmpty()
  type: PostType; // 'loan' o 'sale'

  @IsNumber()
  @IsOptional()
  @Min(0)
  price?: number;
}