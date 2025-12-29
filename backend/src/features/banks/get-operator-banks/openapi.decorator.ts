import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { GetOperatorBanksResponseDto } from './get-operator-banks.response.dto';

export const ApiGetOperatorBanks = () =>
  applyDecorators(
    ApiOperation({ summary: 'Get banks with accounts for operator (sorted by priority)' }),
    ApiOkResponse({ type: GetOperatorBanksResponseDto }),
  );
