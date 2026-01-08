import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { GetActiveUsersResponseDto } from './get-active-users.response.dto';

export const ApiGetActiveUsers = () =>
  applyDecorators(
    ApiOperation({ summary: 'Get active users' }),
    ApiOkResponse({ type: GetActiveUsersResponseDto }),
  );
