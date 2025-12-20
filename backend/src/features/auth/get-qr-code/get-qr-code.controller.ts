import { Controller, Get, Query, Res, StreamableFile } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { GetQrCodeService } from './get-qr-code.service';
import { ApiGetQrCode } from './openapi.decorator';

@Controller('auth')
@ApiTags('Auth - 2FA')
export class GetQrCodeController {
  constructor(private readonly service: GetQrCodeService) {}

  @Get('qr-code')
  @ApiGetQrCode()
  async handle(
    @Query('token') token: string,
    @Res() res: Response,
  ): Promise<void> {
    const qrCodeBuffer = await this.service.execute(token);
    
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', 'inline; filename="qr-code.png"');
    res.send(qrCodeBuffer);
  }
}
