import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiCreatedResponse, ApiUnauthorizedResponse, ApiConflictResponse, ApiQuery } from '@nestjs/swagger';
import { RegisterAdminResponseDto } from './register-admin.response.dto';

export const ApiRegisterAdmin = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Register new admin',
      description: 'Register a new admin using MASTER_KEY as query parameter. Only authorized personnel can create admins.',
    }),
    ApiQuery({
      name: 'masterKey',
      required: true,
      description: 'Master key for admin registration',
      example: 'super-secret-master-key-change-in-production',
    }),
    ApiCreatedResponse({
      description: 'Admin successfully registered',
      type: RegisterAdminResponseDto,
    }),
    ApiUnauthorizedResponse({
      description: 'Invalid master key',
    }),
    ApiConflictResponse({
      description: 'Username or email already exists',
    }),
  );
