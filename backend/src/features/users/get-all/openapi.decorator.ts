import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { GetAllUsersResponseDto } from './get-all.response.dto';

export const ApiGetAllUsers = () =>
  applyDecorators(
    ApiOperation({ 
      summary: '🔴 [ADMIN] Get all users',
      description: 'Returns list of all users with optional filters',
    }),
    ApiOkResponse({
      description: 'Users list',
      type: GetAllUsersResponseDto,
    }),
  );
