import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { GetFreeUsdtLedgerResponseDto } from './get-ledger.response.dto';

export const ApiGetFreeUsdtLedger = () =>
  applyDecorators(
    ApiOperation({ summary: 'Get free USDT ledger (confirmed conversions)' }),
    ApiOkResponse({ type: GetFreeUsdtLedgerResponseDto }),
    ApiQuery({ name: 'page', required: false, example: 1 }),
    ApiQuery({ name: 'limit', required: false, example: 50 }),
  );
