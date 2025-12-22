import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiOkResponse, ApiNotFoundResponse, ApiBadRequestResponse } from '@nestjs/swagger';
import { UpdateUserResponseDto } from './update.response.dto';

export const ApiUpdateUser = () =>
  applyDecorators(
    ApiOperation({ 
      summary: '🔴 [ADMIN] Update user',
      description: 'Updates user username and/or password',
    }),
    ApiOkResponse({
      description: 'User updated successfully',
      type: UpdateUserResponseDto,
    }),
    ApiNotFoundResponse({
      description: 'User not found',
    }),
    ApiBadRequestResponse({
      description: 'Username already exists',
    }),
  );
