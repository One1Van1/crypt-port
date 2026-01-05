import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { GetAllWithdrawalsResponseDto } from './get-all-withdrawals.response.dto';

export const ApiGetAllWithdrawals = () =>
  applyDecorators(
    ApiOperation({ summary: 'Get all cash withdrawals with user information' }),
    ApiOkResponse({ type: GetAllWithdrawalsResponseDto }),
  );
