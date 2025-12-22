import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiOkResponse, ApiNotFoundResponse } from '@nestjs/swagger';
import { UpdateBankAccountPriorityResponseDto } from './update-priority.response.dto';

export const ApiUpdateBankAccountPriority = () =>
  applyDecorators(
    ApiOperation({
      summary: '🟡 [ADMIN, TEAMLEAD] Update bank account priority for distribution',
    }),
    ApiOkResponse({
      description: 'Bank account priority successfully updated',
      type: UpdateBankAccountPriorityResponseDto,
    }),
    ApiNotFoundResponse({
      description: 'Bank account not found',
    }),
  );
