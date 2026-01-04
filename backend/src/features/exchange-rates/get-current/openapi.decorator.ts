import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { ExchangeRateResponseDto } from '../set-rate/set-rate.response.dto';

export const ApiGetCurrentRate = () =>
  applyDecorators(
    ApiOperation({ summary: 'Get current active exchange rate' }),
    ApiOkResponse({ type: ExchangeRateResponseDto }),
  );
