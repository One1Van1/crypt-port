import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiQuery, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { GetPlatformExchangesResponseDto } from './get-exchanges.response.dto';

export const ApiGetPlatformExchanges = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Get USDT→peso exchange history for platforms',
      description: 'Returns records from usdt_to_peso_exchanges with platform info',
    }),
    ApiOkResponse({ type: GetPlatformExchangesResponseDto }),
    ApiQuery({ name: 'page', required: false, example: 1 }),
    ApiQuery({ name: 'limit', required: false, example: 50 }),
    ApiQuery({ name: 'platformId', required: false, example: 1 }),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
  );
