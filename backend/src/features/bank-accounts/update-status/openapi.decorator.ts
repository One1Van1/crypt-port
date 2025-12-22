import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiOkResponse, ApiNotFoundResponse } from '@nestjs/swagger';
import { UpdateBankAccountStatusResponseDto } from './update-status.response.dto';

export const ApiUpdateBankAccountStatus = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Update bank account status - working/not-working/blocked (Admin/Teamlead only)',
    }),
    ApiOkResponse({
      description: 'Bank account status successfully updated',
      type: UpdateBankAccountStatusResponseDto,
    }),
    ApiNotFoundResponse({
      description: 'Bank account not found',
    }),
  );
