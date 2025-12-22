import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiOkResponse, ApiNotFoundResponse } from '@nestjs/swagger';
import { GetUserByIdResponseDto } from './get-by-id.response.dto';

export const ApiGetUserById = () =>
  applyDecorators(
    ApiOperation({ 
      summary: 'Get user by ID (Admin/Teamlead only)',
      description: 'Returns detailed user information',
    }),
    ApiOkResponse({
      description: 'User found',
      type: GetUserByIdResponseDto,
    }),
    ApiNotFoundResponse({
      description: 'User not found',
    }),
  );
