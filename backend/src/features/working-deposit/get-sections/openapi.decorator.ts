import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiOkResponse, ApiUnauthorizedResponse, ApiForbiddenResponse } from '@nestjs/swagger';
import { GetWorkingDepositSectionsResponseDto } from './get-sections.response.dto';

export const ApiGetWorkingDepositSections = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Get working deposit sections',
      description: 'Calculate all sections of working deposit: platform balances, blocked pesos, unpaid pesos, free USDT, and deficit',
    }),
    ApiOkResponse({
      description: 'Working deposit sections calculated successfully',
      type: GetWorkingDepositSectionsResponseDto,
    }),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
    ApiForbiddenResponse({ description: 'Only admin and teamlead can access this' }),
  );
