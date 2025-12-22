import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiOkResponse, ApiNotFoundResponse, ApiConflictResponse } from '@nestjs/swagger';
import { UpdateBankAccountResponseDto } from './update.response.dto';

export const ApiUpdateBankAccount = () =>
  applyDecorators(
    ApiOperation({ summary: 'Update bank account information (Admin/Teamlead only)' }),
    ApiOkResponse({
      description: 'Bank account successfully updated',
      type: UpdateBankAccountResponseDto,
    }),
    ApiNotFoundResponse({
      description: 'Bank account not found',
    }),
    ApiConflictResponse({
      description: 'Validation error',
    }),
  );
