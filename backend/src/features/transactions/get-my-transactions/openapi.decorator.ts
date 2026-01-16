import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiOkResponse, ApiQuery } from '@nestjs/swagger';
import { GetMyTransactionsResponseDto } from './get-my-transactions.response.dto';

export const ApiGetMyTransactions = () =>
  applyDecorators(
    ApiOperation({ summary: 'Get my transactions' }),
    ApiOkResponse({ type: GetMyTransactionsResponseDto }),
    ApiQuery({ name: 'page', required: false, example: 1 }),
    ApiQuery({ name: 'limit', required: false, example: 10 }),
    ApiQuery({ name: 'status', required: false, enum: ['pending', 'completed', 'failed', 'cancelled'] }),
    ApiQuery({ name: 'platformId', required: false, example: 1 }),
    ApiQuery({ name: 'shiftId', required: false, example: '1' }),
    ApiQuery({ name: 'startDate', required: false, example: '2024-01-01T00:00:00.000Z' }),
    ApiQuery({ name: 'endDate', required: false, example: '2024-12-31T23:59:59.999Z' }),
  );
