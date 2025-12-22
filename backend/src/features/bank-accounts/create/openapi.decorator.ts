import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiCreatedResponse, ApiNotFoundResponse, ApiConflictResponse } from '@nestjs/swagger';
import { CreateBankAccountResponseDto } from './create.response.dto';

export const ApiCreateBankAccount = () =>
  applyDecorators(
    ApiOperation({ summary: '🟡 [ADMIN, TEAMLEAD] Create a new bank account' }),
    ApiCreatedResponse({
      description: 'Bank account successfully created',
      type: CreateBankAccountResponseDto,
    }),
    ApiNotFoundResponse({
      description: 'Bank or Drop not found',
    }),
    ApiConflictResponse({
      description: 'Bank account with this CBU already exists',
    }),
  );
