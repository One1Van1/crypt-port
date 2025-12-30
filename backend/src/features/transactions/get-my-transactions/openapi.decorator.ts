import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { GetMyTransactionsResponseDto } from './get-my-transactions.response.dto';

export const ApiGetMyTransactions = () =>
  applyDecorators(
    ApiOperation({ summary: 'Get my transactions' }),
    ApiOkResponse({ type: GetMyTransactionsResponseDto }),
  );
