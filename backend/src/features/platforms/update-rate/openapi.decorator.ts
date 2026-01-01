import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiOkResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { UpdateExchangeRateResponseDto } from './update-rate.response.dto';
import { UpdateExchangeRateRequestDto } from './update-rate.request.dto';

export const ApiUpdateExchangeRate = () =>
  applyDecorators(
    ApiOperation({ 
      summary: 'Update platform exchange rate',
      description: 'Admin can update ARS to USDT exchange rate for a platform'
    }),
    ApiParam({ name: 'id', description: 'Platform ID' }),
    ApiBody({ type: UpdateExchangeRateRequestDto }),
    ApiOkResponse({ type: UpdateExchangeRateResponseDto }),
  );
