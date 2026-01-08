import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { GetInactiveUsersResponseDto } from './get-inactive-users.response.dto';

export const ApiGetInactiveUsers = () =>
  applyDecorators(
    ApiOperation({ summary: 'Get inactive users (includes deleted)' }),
    ApiOkResponse({ type: GetInactiveUsersResponseDto }),
  );
