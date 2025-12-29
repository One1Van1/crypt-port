import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiOkResponse, ApiQuery, ApiParam } from '@nestjs/swagger';
import { GetDropTransactionsForOperatorResponseDto } from './get-drop-transactions-for-operator.response.dto';

export const ApiGetDropTransactionsForOperator = () =>
  applyDecorators(
    ApiOperation({ summary: 'Get drop transactions for operator' }),
    ApiParam({ name: 'dropId', description: 'Drop ID' }),
    ApiQuery({ name: 'page', required: false, example: 1 }),
    ApiQuery({ name: 'limit', required: false, example: 5 }),
    ApiOkResponse({ type: GetDropTransactionsForOperatorResponseDto }),
  );
