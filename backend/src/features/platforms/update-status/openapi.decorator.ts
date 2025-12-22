import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiOkResponse, ApiNotFoundResponse } from '@nestjs/swagger';
import { UpdatePlatformStatusResponseDto } from './update-status.response.dto';

export const ApiUpdatePlatformStatus = () =>
  applyDecorators(
    ApiOperation({ summary: 'Update platform status (Admin only)' }),
    ApiOkResponse({
      description: 'Platform status successfully updated',
      type: UpdatePlatformStatusResponseDto,
    }),
    ApiNotFoundResponse({
      description: 'Platform not found',
    }),
  );
