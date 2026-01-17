import { applyDecorators } from '@nestjs/common';
import { ApiBadRequestResponse, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { MintFreeUsdtResponseDto } from './mint.response.dto';

export const ApiMintFreeUsdt = () =>
  applyDecorators(
    ApiOperation({ summary: 'Admin: add free USDT (mint)' }),
    ApiOkResponse({ type: MintFreeUsdtResponseDto }),
    ApiBadRequestResponse({ description: 'Validation error' }),
  );
