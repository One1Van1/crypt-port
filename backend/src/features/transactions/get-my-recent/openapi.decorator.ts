import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { GetMyRecentTransactionsResponseDto } from './get-my-recent.response.dto';

export const ApiGetMyRecentTransactions = () =>
  applyDecorators(
    ApiOperation({ summary: 'Get my recent transactions for dashboard' }),
    ApiOkResponse({ type: GetMyRecentTransactionsResponseDto }),
    ApiQuery({ name: 'limit', required: false, example: 10 }),
  );
