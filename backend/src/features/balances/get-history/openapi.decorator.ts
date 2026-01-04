import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiOkResponse, ApiQuery } from '@nestjs/swagger';
import { GetBalanceHistoryResponseDto } from './get-history.response.dto';

export const ApiGetBalanceHistory = () =>
  applyDecorators(
    ApiOperation({ 
      summary: 'Get balance change history',
      description: 'Returns history of balance changes with optional platform filter',
    }),
    ApiOkResponse({ type: GetBalanceHistoryResponseDto }),
    ApiQuery({ name: 'platformId', required: false, type: Number }),
    ApiQuery({ name: 'limit', required: false, type: Number, example: 50 }),
  );
