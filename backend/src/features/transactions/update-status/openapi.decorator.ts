import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiOkResponse, ApiNotFoundResponse, ApiBadRequestResponse } from '@nestjs/swagger';
import { UpdateTransactionStatusResponseDto } from './update-status.response.dto';

export const ApiUpdateTransactionStatus = () =>
  applyDecorators(
    ApiOperation({ 
      summary: '🟡 [ADMIN, TEAMLEAD] Update transaction status',
      description: 'Updates transaction status. If cancelled from PENDING, returns balance to bank account',
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
