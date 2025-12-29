import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { GetOperatorDropsResponseDto } from './get-operator-drops.response.dto';

export const ApiGetOperatorDrops = () =>
  applyDecorators(
    ApiOperation({ summary: 'Get drops for operator with bank accounts info' }),
    ApiOkResponse({ type: GetOperatorDropsResponseDto }),
  );
