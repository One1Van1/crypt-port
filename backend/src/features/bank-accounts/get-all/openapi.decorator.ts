import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { GetAllBankAccountsResponseDto } from './get-all.response.dto';

export const ApiGetAllBankAccounts = () =>
  applyDecorators(
    ApiOperation({ summary: '⚪ [ANY] Get all bank accounts with optional filters' }),
    ApiOkResponse({
      description: 'List of bank accounts sorted by priority',
      type: GetAllBankAccountsResponseDto,
    }),
  );
