import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { GetAllBalancesResponseDto } from './get-all.response.dto';

export const ApiGetAllBalances = () =>
  applyDecorators(
    ApiOperation({ 
      summary: 'Get all balances (Admin/Teamlead only)',
      description: 'Returns list of all balances with optional filters',
    }),
    ApiOkResponse({
      description: 'Balances list',
      type: GetAllBalancesResponseDto,
    }),
  );
