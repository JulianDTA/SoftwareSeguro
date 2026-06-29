import { Injectable, Logger } from '@nestjs/common';
import { VaultService } from './vault.service';

export interface AdoptionPayload {
  dogId: string;
  dogName: string;
  adopterEmail: string;
  adopterName: string;
  adoptionDate: string;
  refugioSource: string;
}

@Injectable()
export class SecureService {
  private readonly logger = new Logger(SecureService.name);

  constructor(private readonly vaultService: VaultService) {}

  async processAdoptionRequest(encryptedPayload: string): Promise<AdoptionPayload> {
    const decrypted = await this.vaultService.decrypt(encryptedPayload);
    const payload: AdoptionPayload = JSON.parse(decrypted) as AdoptionPayload;

    this.logger.log(
      `Adopción recibida de ${payload.refugioSource}: ${payload.dogName} → ${payload.adopterEmail}`,
    );

    return payload;
  }
}
