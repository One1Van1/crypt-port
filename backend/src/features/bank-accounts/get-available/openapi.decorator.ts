import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiOkResponse, ApiNotFoundResponse } from '@nestjs/swagger';
import { GetAvailableBankAccountResponseDto } from './get-available.response.dto';

export const ApiGetAvailableBankAccount = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Get available bank account for withdrawal based on priority and limits',
      description:
        'Returns the best available bank account considering: ' +
        '1) Only WORKING status accounts, ' +
        '2) Sufficient available balance (limit - withdrawn >= amount), ' +
        '3) Priority (lower number = higher priority), ' +
        '4) Last used time (less recently used first)',
    }),
    ApiOkResponse({
      description: 'Available bank account found',
      type: GetAvailableBankAccountResponseDto,
    }),
    ApiNotFoundResponse({
      description: 'No available bank account found with sufficient balance',
    }),
  );
