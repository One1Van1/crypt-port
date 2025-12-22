import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiOkResponse, ApiUnauthorizedResponse, ApiBadRequestResponse } from '@nestjs/swagger';
import { Verify2faResponseDto } from './verify-2fa.response.dto';

export const ApiVerify2fa = () =>
  applyDecorators(
    ApiOperation({
      summary: '🔓 [PUBLIC] Verify 2FA code and complete login',
      description: 'Second step of authentication. Verify Google Authenticator code and receive access/refresh tokens.',
    }),
    ApiOkResponse({
      description: 'Login successful, tokens issued',
      type: Verify2faResponseDto,
    }),
    ApiUnauthorizedResponse({
      description: 'Invalid or expired temporary token',
    }),
    ApiBadRequestResponse({
      description: 'Invalid 2FA code',
    }),
  );
