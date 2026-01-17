import { applyDecorators } from '@nestjs/common';
import { ApiBadRequestResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { UpdateWithdrawnAmountResponseDto } from './update-withdrawn-amount.response.dto';

export const ApiUpdateWithdrawnAmount = () =>
  applyDecorators(
    ApiOperation({
      summary: '🔴 [ADMIN] Update bank account withdrawn amount (recalculates available)',
    }),
    ApiOkResponse({
      description: 'Withdrawn amount successfully updated',
      type: UpdateWithdrawnAmountResponseDto,
    }),
    ApiBadRequestResponse({
      description: 'Invalid withdrawn amount',
    }),
    ApiNotFoundResponse({
      description: 'Bank account not found',
    }),
  );
