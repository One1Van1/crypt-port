import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiOkResponse, ApiNotFoundResponse, ApiBadRequestResponse } from '@nestjs/swagger';
import { UpdateTransactionStatusResponseDto } from './update-status.response.dto';

export const ApiUpdateTransactionStatus = () =>
  applyDecorators(
    ApiOperation({ 
      summary: '🟡 [ADMIN, TEAMLEAD] Update transaction status (mainly for cancellation)',
      description: 'Updates transaction status. Transactions are created as COMPLETED (operator confirms fact). This endpoint is used to cancel erroneously created operations (COMPLETED -> FAILED), which returns balance to bank account',
    }),
    ApiOkResponse({
      description: 'Transaction status updated',
      type: UpdateTransactionStatusResponseDto,
    }),
    ApiNotFoundResponse({
      description: 'Transaction not found',
    }),
    ApiBadRequestResponse({
      description: 'Cannot change status of completed or cancelled transaction',
    }),
  );
