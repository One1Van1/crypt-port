import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiOkResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ExchangeRateResponseDto } from './set-rate.response.dto';

export const ApiSetExchangeRate = () =>
  applyDecorators(
    ApiOperation({ summary: 'Set new exchange rate (Admin only)' }),
    ApiOkResponse({ type: ExchangeRateResponseDto }),
    ApiBearerAuth(),
  );
