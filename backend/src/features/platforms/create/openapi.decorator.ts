import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiCreatedResponse, ApiConflictResponse } from '@nestjs/swagger';
import { CreatePlatformResponseDto } from './create.response.dto';

export const ApiCreatePlatform = () =>
  applyDecorators(
    ApiOperation({ summary: '🔴 [ADMIN] Create a new platform' }),
    ApiCreatedResponse({
      description: 'Platform successfully created',
      type: CreatePlatformResponseDto,
    }),
    ApiConflictResponse({
      description: 'Platform with this name already exists',
    }),
  );
