import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiOkResponse, ApiNotFoundResponse } from '@nestjs/swagger';
import { GetPlatformByIdResponseDto } from './get-by-id.response.dto';

export const ApiGetPlatformById = () =>
  applyDecorators(
    ApiOperation({ summary: 'Get platform by ID' }),
    ApiOkResponse({
      description: 'Platform found',
      type: GetPlatformByIdResponseDto,
    }),
    ApiNotFoundResponse({
      description: 'Platform not found',
    }),
  );
