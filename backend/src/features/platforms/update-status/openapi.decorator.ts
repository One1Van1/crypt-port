import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiOkResponse, ApiNotFoundResponse } from '@nestjs/swagger';
import { UpdatePlatformStatusResponseDto } from './update-status.response.dto';

export const ApiUpdatePlatformStatus = () =>
  applyDecorators(
    ApiOperation({ summary: '🔴 [ADMIN] Update platform status' }),
    ApiOkResponse({
      description: 'Platform status successfully updated',
      type: UpdatePlatformStatusResponseDto,
    }),
    ApiNotFoundResponse({
      description: 'Platform not found',
    }),
  );
