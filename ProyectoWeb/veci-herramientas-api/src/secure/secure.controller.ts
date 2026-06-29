import { Body, Controller, HttpCode, Logger, Post } from '@nestjs/common';
import { EncryptedRequestDto } from './dto/encrypted-request.dto';
import { SecureService } from './secure.service';

@Controller('api/secure')
export class SecureController {
  private readonly logger = new Logger(SecureController.name);

  constructor(private readonly secureService: SecureService) {}

  /**
   * Recibe un payload de adopción cifrado con Vault Transit desde RefugioHuellas.
   * Lo descifra y registra la notificación de adopción.
   */
  @Post('adoption')
  @HttpCode(200)
  async receiveAdoption(@Body() dto: EncryptedRequestDto) {
    this.logger.log('POST /api/secure/adoption — payload cifrado recibido');
    const adoption = await this.secureService.processAdoptionRequest(dto.encryptedPayload);
    return {
      success: true,
      message: 'Adopción registrada correctamente en Veci-Herramientas',
      data: adoption,
    };
  }
}
