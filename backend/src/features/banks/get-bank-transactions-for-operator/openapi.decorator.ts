import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiOkResponse, ApiQuery, ApiParam } from '@nestjs/swagger';
import { GetBankTransactionsForOperatorResponseDto } from './get-bank-transactions-for-operator.response.dto';

export const ApiGetBankTransactionsForOperator = () =>
  applyDecorators(
    ApiOperation({ summary: 'Get bank transactions for operator' }),
    ApiParam({ name: 'bankId', description: 'Bank ID' }),
    ApiQuery({ name: 'page', required: false, example: 1 }),
    ApiQuery({ name: 'limit', required: false, example: 5 }),
    ApiOkResponse({ type: GetBankTransactionsForOperatorResponseDto }),
  );
