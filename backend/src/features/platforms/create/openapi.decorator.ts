import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiCreatedResponse, ApiConflictResponse } from '@nestjs/swagger';
import { CreatePlatformResponseDto } from './create.response.dto';

export const ApiCreatePlatform = () =>
  applyDecorators(
    ApiOperation({ summary: 'Create a new platform (Admin only)' }),
    ApiCreatedResponse({
      description: 'Platform successfully created',
      type: CreatePlatformResponseDto,
    }),
    ApiConflictResponse({
      description: 'Platform with this name already exists',
    }),
  );
