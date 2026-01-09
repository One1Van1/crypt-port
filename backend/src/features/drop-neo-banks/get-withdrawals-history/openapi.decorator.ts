import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { GetNeoBankWithdrawalsHistoryResponseDto } from './get-withdrawals-history.response.dto';

export const ApiGetNeoBankWithdrawalsHistory = () =>
  applyDecorators(
    ApiOperation({ summary: 'Get neo-bank withdrawals history (who/when/how much)' }),
    ApiOkResponse({ type: GetNeoBankWithdrawalsHistoryResponseDto }),
    ApiQuery({ name: 'neoBankId', required: true, example: 1 }),
    ApiQuery({ name: 'limit', required: false, example: 20 }),
    ApiQuery({ name: 'offset', required: false, example: 0 }),
  );
