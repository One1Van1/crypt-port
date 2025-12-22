import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiOkResponse, ApiNotFoundResponse, ApiConflictResponse } from '@nestjs/swagger';
import { UpdatePlatformResponseDto } from './update.response.dto';

export const ApiUpdatePlatform = () =>
  applyDecorators(
    ApiOperation({ summary: '🔴 [ADMIN] Update platform information' }),
    ApiOkResponse({
      description: 'Platform successfully updated',
      type: UpdatePlatformResponseDto,
    }),
    ApiNotFoundResponse({
      description: 'Platform not found',
    }),
    ApiConflictResponse({
      description: 'Platform with this name already exists',
    }),
  );
