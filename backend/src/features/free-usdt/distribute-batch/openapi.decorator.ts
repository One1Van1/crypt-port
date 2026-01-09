import { applyDecorators } from '@nestjs/common';
import { ApiBadRequestResponse, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { DistributeFreeUsdtBatchResponseDto } from './distribute-batch.response.dto';

export const ApiDistributeFreeUsdtBatch = () =>
  applyDecorators(
    ApiOperation({ summary: 'Distribute free USDT to multiple platforms (batch)' }),
    ApiOkResponse({ type: DistributeFreeUsdtBatchResponseDto }),
    ApiBadRequestResponse({ description: 'Invalid payload or insufficient free USDT' }),
  );
