import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { GetAllUsersResponseDto } from './get-all.response.dto';

export const ApiGetAllUsers = () =>
  applyDecorators(
    ApiOperation({ 
      summary: 'Get all users (Admin/Teamlead only)',
      description: 'Returns list of all users with optional filters',
    }),
    ApiOkResponse({
      description: 'Users list',
      type: GetAllUsersResponseDto,
    }),
  );
