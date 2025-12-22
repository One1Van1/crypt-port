import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiOkResponse, ApiBearerAuth } from '@nestjs/swagger';
import { MeResponseDto } from './me.response.dto';

export const ApiMe = () =>
  applyDecorators(
    ApiOperation({
      summary: '⚪ [ANY] Get current user info',
      description: 'Get information about currently authenticated user',
    }),
    ApiBearerAuth(),
    ApiOkResponse({
      description: 'User info retrieved successfully',
      type: MeResponseDto,
    }),
  );
