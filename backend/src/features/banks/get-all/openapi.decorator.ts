import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { GetAllBanksResponseDto } from './get-all.response.dto';

export const ApiGetAllBanks = () =>
  applyDecorators(
    ApiOperation({ 
      summary: '⚪ [ANY] Get all banks with optional filters',
      description: 'Any authenticated user can view banks'
    }),
    ApiOkResponse({
      description: 'List of banks',
      type: GetAllBanksResponseDto,
    }),
  );
