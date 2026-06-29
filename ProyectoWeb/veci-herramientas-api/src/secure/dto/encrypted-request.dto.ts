import { IsNotEmpty, IsString } from 'class-validator';

export class EncryptedRequestDto {
  @IsString()
  @IsNotEmpty()
  encryptedPayload: string;
}
