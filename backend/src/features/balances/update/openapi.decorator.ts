import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiOkResponse, ApiNotFoundResponse } from '@nestjs/swagger';
import { UpdateBalanceResponseDto } from './update.response.dto';

export const ApiUpdateBalance = () =>
  applyDecorators(
    ApiOperation({ 
      summary: 'Update balance amount (Admin only)',
      description: 'Updates balance amount manually',
    }),
    ApiOkResponse({
      description: 'Balance updated successfully',
      type: UpdateBalanceResponseDto,
    }),
    ApiNotFoundResponse({
      description: 'Balance not found',
    }),
  );
