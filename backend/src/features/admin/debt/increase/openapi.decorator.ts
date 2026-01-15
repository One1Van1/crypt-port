import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { DebtAmountChangeResponseDto } from '../shared/amount.response.dto';

export const ApiIncreaseDebt = () =>
  applyDecorators(
    ApiOperation({ summary: '🟣 [ADMIN] Increase debt by amount (USDT)' }),
    ApiOkResponse({ type: DebtAmountChangeResponseDto }),
  );
