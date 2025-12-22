import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiCreatedResponse, ApiConflictResponse } from '@nestjs/swagger';
import { RegisterResponseDto } from './register.response.dto';

export const ApiRegister = () =>
  applyDecorators(
    ApiOperation({
      summary: '🔓 [PUBLIC] Register new user',
      description: 'Register a new user with PENDING role. User must wait for admin approval.',
    }),
    ApiCreatedResponse({
      description: 'User successfully registered',
      type: RegisterResponseDto,
    }),
    ApiConflictResponse({
      description: 'Username or email already exists',
    }),
  );
