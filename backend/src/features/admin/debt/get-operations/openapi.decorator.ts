import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { GetDebtOperationsResponseDto } from './get-operations.response.dto';
import { DebtOperationType } from '../../../../entities/debt-operation.entity';

export const ApiGetDebtOperations = () =>
  applyDecorators(
    ApiOperation({ summary: '🟣 [ADMIN, TEAMLEAD] Get debt operations history' }),
    ApiOkResponse({ type: GetDebtOperationsResponseDto }),
    ApiQuery({ name: 'page', required: false, example: 1 }),
    ApiQuery({ name: 'limit', required: false, example: 30 }),
    ApiQuery({ name: 'type', required: false, enum: DebtOperationType, enumName: 'DebtOperationType' }),
  );
