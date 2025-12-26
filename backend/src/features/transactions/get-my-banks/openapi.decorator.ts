import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { GetMyBanksResponseDto } from './get-my-banks.response.dto';

export const ApiGetMyBanks = () =>
  applyDecorators(
    ApiOperation({ summary: 'Get unique banks from my transactions' }),
    ApiOkResponse({ type: GetMyBanksResponseDto }),
  );
