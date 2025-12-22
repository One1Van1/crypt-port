import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiOkResponse, ApiNotFoundResponse } from '@nestjs/swagger';
import { GetBankByIdResponseDto } from './get-by-id.response.dto';

export const ApiGetBankById = () =>
  applyDecorators(
    ApiOperation({ 
      summary: '⚪ [ANY] Get bank by ID',
      description: 'Any authenticated user can view bank details'
    }),
    ApiOkResponse({
      description: 'Bank found',
      type: GetBankByIdResponseDto,
    }),
    ApiNotFoundResponse({
      description: 'Bank not found',
    }),
  );
