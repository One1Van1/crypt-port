import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiOkResponse, ApiBearerAuth } from '@nestjs/swagger';
import { LogoutResponseDto } from './logout.response.dto';

export const ApiLogout = () =>
  applyDecorators(
    ApiOperation({
      summary: '⚪ [ANY] Logout user',
      description: 'Logout current user (client should discard tokens)',
    }),
    ApiBearerAuth(),
    ApiOkResponse({
      description: 'Logout successful',
      type: LogoutResponseDto,
    }),
  );
