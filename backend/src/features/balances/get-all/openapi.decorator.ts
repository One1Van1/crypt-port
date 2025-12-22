import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { GetAllBalancesResponseDto } from './get-all.response.dto';

export const ApiGetAllBalances = () =>
  applyDecorators(
    ApiOperation({ 
      summary: '🟡 [ADMIN, TEAMLEAD] Get all balances',
      description: 'Returns list of all balances with optional filters',
    }),
    ApiOkResponse({
      description: 'Balances list',
      type: GetAllBalancesResponseDto,
    }),
  );
