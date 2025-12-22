import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { GetAllPlatformsResponseDto } from './get-all.response.dto';

export const ApiGetAllPlatforms = () =>
  applyDecorators(
    ApiOperation({ summary: 'Get all platforms with optional filters' }),
    ApiOkResponse({
      description: 'List of platforms',
      type: GetAllPlatformsResponseDto,
    }),
  );
