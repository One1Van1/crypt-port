import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiOkResponse, ApiNotFoundResponse, ApiQuery } from '@nestjs/swagger';
import { GetAvailableBankAccountResponseDto } from './get-available.response.dto';

export const ApiGetAvailableBankAccount = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Get available bank account for withdrawal',
      description:
        'Returns the best available bank account considering: 1) Only WORKING status accounts, 2) Sufficient available balance (limit - withdrawn >= amount), 3) Priority (lower number = higher priority), 4) Last used time (less recently used first)',
    }),
    ApiQuery({
      name: 'amount',
      required: false,
      type: Number,
      description: 'Required withdrawal amount (optional, for filtering)',
      example: 10000,
    }),
    ApiQuery({
      name: 'bankId',
      required: false,
      type: Number,
      description: 'Filter by specific bank ID (optional)',
      example: 6,
    }),
    ApiOkResponse({
      description: 'Available bank account found',
      type: GetAvailableBankAccountResponseDto,
    }),
    ApiNotFoundResponse({
      description: 'No available bank accounts found',
    }),
  );
