import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateFavoriteDto {
  @IsNotEmpty()
  @IsUUID()
  toolId: string;
}