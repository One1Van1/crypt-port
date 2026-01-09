import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOperation,
} from '@nestjs/swagger';

export const ApiDeleteBankAccount = () =>
  applyDecorators(
    ApiOperation({
      summary: '🟡 [ADMIN, TEAMLEAD] Delete a bank account (soft delete)',
      description: 'Allowed only when withdrawnAmount = 0',
    }),
    ApiNoContentResponse({ description: 'Bank account successfully deleted' }),
    ApiBadRequestResponse({
      description: 'Cannot delete bank account with withdrawn amount > 0',
    }),
    ApiNotFoundResponse({ description: 'Bank account not found' }),
  );
