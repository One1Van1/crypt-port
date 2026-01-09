import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { TransactionV2ItemDto } from '../get-all-v2/get-all-v2.response.dto';

export const ApiGetTransactionByIdV2 = () =>
  applyDecorators(
    ApiOperation({ summary: 'Get transaction by ID (v2 list-compatible)' }),
    ApiOkResponse({ type: TransactionV2ItemDto }),
  );
