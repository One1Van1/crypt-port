import { applyDecorators } from '@nestjs/common';
import { ApiCreatedResponse, ApiOperation } from '@nestjs/swagger';
import { CreateDebtResponseDto } from './create.response.dto';

export const ApiCreateDebt = () =>
  applyDecorators(
    ApiOperation({ summary: '🔴 [ADMIN] Create debt (USDT)' }),
    ApiCreatedResponse({ type: CreateDebtResponseDto }),
  );
