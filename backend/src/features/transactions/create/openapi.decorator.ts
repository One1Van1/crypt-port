import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiCreatedResponse, ApiBadRequestResponse, ApiNotFoundResponse } from '@nestjs/swagger';
import { CreateTransactionResponseDto } from './create.response.dto';

export const ApiCreateTransaction = () =>
  applyDecorators(
    ApiOperation({ 
      summary: 'Create new withdrawal transaction (Operator only)',
      description: 'Creates transaction, selects bank account with priority, updates balances and shift statistics',
    }),
    ApiCreatedResponse({
      description: 'Transaction created successfully',
      type: CreateTransactionResponseDto,
    }),
    ApiBadRequestResponse({
      description: 'No active shift or no available bank accounts with sufficient balance',
    }),
    ApiNotFoundResponse({
      description: 'Platform not found',
    }),
  );
