import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class VaultService {
  private readonly logger = new Logger(VaultService.name);
  private readonly vaultAddr: string;
  private readonly vaultToken: string;
  private readonly transitKey: string;

  constructor() {
    this.vaultAddr = process.env.VAULT_ADDR ?? 'http://localhost:8200';
    this.vaultToken = process.env.VAULT_TOKEN ?? 'dev-only-token';
    this.transitKey = process.env.VAULT_TRANSIT_KEY ?? 'sso-comms';
  }

  async encrypt(plaintext: string): Promise<string> {
    const encoded = Buffer.from(plaintext, 'utf-8').toString('base64');
    const res = await fetch(
      `${this.vaultAddr}/v1/transit/encrypt/${this.transitKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Vault-Token': this.vaultToken,
        },
        body: JSON.stringify({ plaintext: encoded }),
      },
    );
    if (!res.ok) throw new Error(`Vault encrypt failed: ${res.status}`);
    const data = (await res.json()) as { data: { ciphertext: string } };
    this.logger.debug('Payload cifrado con Vault Transit AES-256-GCM');
    return data.data.ciphertext;
  }

  async decrypt(ciphertext: string): Promise<string> {
    const res = await fetch(
      `${this.vaultAddr}/v1/transit/decrypt/${this.transitKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Vault-Token': this.vaultToken,
        },
        body: JSON.stringify({ ciphertext }),
      },
    );
    if (!res.ok) throw new Error(`Vault decrypt failed: ${res.status}`);
    const data = (await res.json()) as { data: { plaintext: string } };
    this.logger.debug('Payload descifrado con Vault Transit');
    return Buffer.from(data.data.plaintext, 'base64').toString('utf-8');
  }
}
