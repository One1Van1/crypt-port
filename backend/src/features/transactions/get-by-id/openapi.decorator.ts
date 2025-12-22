import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiOkResponse, ApiNotFoundResponse } from '@nestjs/swagger';
import { GetTransactionByIdResponseDto } from './get-by-id.response.dto';

export const ApiGetTransactionById = () =>
  applyDecorators(
    ApiOperation({ 
      summary: 'Get transaction by ID (Admin/Teamlead only)',
      description: 'Returns detailed transaction information',
    }),
    ApiOkResponse({
      description: 'Transaction found',
      type: GetTransactionByIdResponseDto,
    }),
    ApiNotFoundResponse({
      description: 'Transaction not found',
    }),
  );
