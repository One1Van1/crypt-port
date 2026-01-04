import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiOkResponse, ApiBadRequestResponse, ApiUnauthorizedResponse, ApiForbiddenResponse } from '@nestjs/swagger';
import { ExchangeUsdtToPesosResponseDto } from './exchange-usdt-to-pesos.response.dto';

export const ApiExchangeUsdtToPesos = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Exchange USDT to Pesos (Admin only)',
      description: 'Admin withdraws USDT from platform and deposits pesos to neo-bank. Exchange rate is taken from platform settings automatically.',
    }),
    ApiOkResponse({
      description: 'Exchange completed successfully',
      type: ExchangeUsdtToPesosResponseDto,
    }),
    ApiBadRequestResponse({ description: 'Invalid data or insufficient balance' }),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
    ApiForbiddenResponse({ description: 'Only admin can perform this action' }),
  );
