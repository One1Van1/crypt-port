import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiOkResponse, ApiNotFoundResponse, ApiUnauthorizedResponse, ApiQuery, ApiProduces } from '@nestjs/swagger';

export const ApiGetQrCode = () =>
  applyDecorators(
    ApiOperation({
      summary: '⚪ [ANY] Get QR code for 2FA setup',
      description: 'Get QR code image using temporary token from registration. Token expires in 10 minutes. Returns PNG image that can be scanned with Google Authenticator.',
    }),
    ApiQuery({
      name: 'token',
      required: true,
      description: 'Temporary token from registration response',
      example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    }),
    ApiProduces('image/png'),
    ApiOkResponse({
      description: 'QR code image',
      schema: {
        type: 'string',
        format: 'binary',
      },
    }),
    ApiUnauthorizedResponse({
      description: 'Invalid or expired token',
    }),
    ApiNotFoundResponse({
      description: 'User or 2FA secret not found',
    }),
  );
