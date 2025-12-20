import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiOkResponse, ApiUnauthorizedResponse, ApiForbiddenResponse } from '@nestjs/swagger';
import { LoginResponseDto } from './login.response.dto';

export const ApiLogin = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Login with username and password',
      description: 'First step of authentication. Returns temporary token for 2FA verification.',
    }),
    ApiOkResponse({
      description: 'Credentials valid, proceed with 2FA',
      type: LoginResponseDto,
    }),
    ApiUnauthorizedResponse({
      description: 'Invalid credentials',
    }),
    ApiForbiddenResponse({
      description: 'Account pending approval',
    }),
  );
