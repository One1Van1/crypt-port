import { ApiProperty } from '@nestjs/swagger';

export class GetQrCodeResponseDto {
  @ApiProperty({ description: 'QR code as data URL' })
  qrCodeUrl: string;

  @ApiProperty({ description: 'Secret key for manual entry' })
  secret: string;

  @ApiProperty({ description: 'Message' })
  message: string;

  constructor(qrCodeUrl: string, secret: string) {
    this.qrCodeUrl = qrCodeUrl;
    this.secret = secret;
    this.message = 'Scan QR code with Google Authenticator app';
  }
}
