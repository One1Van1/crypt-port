import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { DebtAmountChangeResponseDto } from '../shared/amount.response.dto';

export const ApiDecreaseDebt = () =>
  applyDecorators(
    ApiOperation({ summary: '🟣 [ADMIN] Decrease debt by amount (USDT)' }),
    ApiOkResponse({ type: DebtAmountChangeResponseDto }),
  );
