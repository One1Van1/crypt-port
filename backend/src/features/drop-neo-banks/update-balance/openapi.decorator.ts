import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiOkResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { UpdateBalanceResponseDto } from './update-balance.response.dto';
import { UpdateBalanceRequestDto } from './update-balance.request.dto';

export const ApiUpdateBalance = () =>
  applyDecorators(
    ApiOperation({ 
      summary: 'Update neo-bank balance manually',
      description: 'Admin or TeamLead can manually update the balance of a neo-bank account'
    }),
    ApiParam({ name: 'id', description: 'Neo-bank ID' }),
    ApiBody({ type: UpdateBalanceRequestDto }),
    ApiOkResponse({ type: UpdateBalanceResponseDto }),
  );
