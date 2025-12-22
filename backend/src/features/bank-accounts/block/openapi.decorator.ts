import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiOkResponse, ApiNotFoundResponse } from '@nestjs/swagger';
import { BlockBankAccountResponseDto } from './block.response.dto';

export const ApiBlockBankAccount = () =>
  applyDecorators(
    ApiOperation({
      summary: '🟡 [ADMIN, TEAMLEAD] Block bank account with reason',
    }),
    ApiOkResponse({
      description: 'Bank account successfully blocked',
      type: BlockBankAccountResponseDto,
    }),
    ApiNotFoundResponse({
      description: 'Bank account not found',
    }),
  );
