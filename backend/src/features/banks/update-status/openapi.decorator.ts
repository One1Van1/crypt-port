import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiOkResponse, ApiNotFoundResponse } from '@nestjs/swagger';
import { UpdateBankStatusResponseDto } from './update-status.response.dto';

export const ApiUpdateBankStatus = () =>
  applyDecorators(
    ApiOperation({ summary: 'Update bank status (activate/deactivate)' }),
    ApiOkResponse({
      description: 'Bank status successfully updated',
      type: UpdateBankStatusResponseDto,
    }),
    ApiNotFoundResponse({
      description: 'Bank not found',
    }),
  );
