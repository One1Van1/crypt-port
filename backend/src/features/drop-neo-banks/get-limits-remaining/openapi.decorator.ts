import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { GetNeoBankLimitsRemainingResponseDto } from './get-limits-remaining.response.dto';

export const ApiGetNeoBankLimitsRemaining = () =>
  applyDecorators(
    ApiOperation({ summary: 'Get neo-bank limits remaining (computed from neo_bank_withdrawals)' }),
    ApiOkResponse({ type: GetNeoBankLimitsRemainingResponseDto }),
    ApiQuery({ name: 'dropId', required: false, example: 1 }),
    ApiQuery({ name: 'platformId', required: false, example: 1 }),
    ApiQuery({ name: 'provider', required: false, example: 'ripio' }),
    ApiQuery({ name: 'status', required: false, example: 'active' }),
  );
