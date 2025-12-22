import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiOkResponse, ApiNotFoundResponse } from '@nestjs/swagger';
import { GetBankAccountByIdResponseDto } from './get-by-id.response.dto';

export const ApiGetBankAccountById = () =>
  applyDecorators(
    ApiOperation({ summary: '⚪ [ANY] Get bank account by ID with full details' }),
    ApiOkResponse({
      description: 'Bank account found',
      type: GetBankAccountByIdResponseDto,
    }),
    ApiNotFoundResponse({
      description: 'Bank account not found',
    }),
  );
