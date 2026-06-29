import { Module } from '@nestjs/common';
import { SecureController } from './secure.controller';
import { SecureService } from './secure.service';
import { VaultService } from './vault.service';

@Module({
  controllers: [SecureController],
  providers: [SecureService, VaultService],
  exports: [VaultService],
})
export class SecureModule {}
