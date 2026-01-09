import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { GetAllTransactionsV2ResponseDto } from './get-all-v2.response.dto';

export const ApiGetAllTransactionsV2 = () =>
  applyDecorators(
    ApiOperation({ summary: 'Get all transactions (v2, supports searching by transaction id)' }),
    ApiOkResponse({ type: GetAllTransactionsV2ResponseDto }),
    ApiQuery({ name: 'page', required: false, example: 1 }),
    ApiQuery({ name: 'limit', required: false, example: 10 }),
    ApiQuery({ name: 'status', required: false, example: 'completed' }),
    ApiQuery({ name: 'userId', required: false, example: 12 }),
    ApiQuery({ name: 'platformId', required: false, example: 1 }),
    ApiQuery({ name: 'bankId', required: false, example: 1 }),
    ApiQuery({ name: 'dropNeoBankId', required: false, example: 1 }),
    ApiQuery({ name: 'search', required: false, example: '123' }),
    ApiQuery({ name: 'startDate', required: false, example: '2025-12-01T00:00:00.000Z' }),
    ApiQuery({ name: 'endDate', required: false, example: '2025-12-31T23:59:59.999Z' }),
    ApiQuery({ name: 'minAmount', required: false, example: 1000 }),
    ApiQuery({ name: 'maxAmount', required: false, example: 100000 }),
  );
