import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { UpdateDebtResponseDto } from './update.response.dto';

export const ApiUpdateDebt = () =>
  applyDecorators(
    ApiOperation({ summary: '🔴 [ADMIN] Update debt amount (USDT)' }),
    ApiOkResponse({ type: UpdateDebtResponseDto }),
  );
