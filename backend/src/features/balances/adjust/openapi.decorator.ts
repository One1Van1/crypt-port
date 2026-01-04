import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiOkResponse, ApiBadRequestResponse, ApiNotFoundResponse } from '@nestjs/swagger';
import { AdjustBalanceResponseDto } from './adjust.response.dto';

export const ApiAdjustBalance = () =>
  applyDecorators(
    ApiOperation({ 
      summary: 'Adjust balance by adding or subtracting amount',
      description: 'Admin can adjust platform balance by positive (add) or negative (subtract) amount',
    }),
    ApiOkResponse({ type: AdjustBalanceResponseDto }),
    ApiNotFoundResponse({ description: 'Balance not found' }),
    ApiBadRequestResponse({ description: 'Adjustment would result in negative balance' }),
  );
