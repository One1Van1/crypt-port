import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { GetAllDropsResponseDto } from './get-all.response.dto';

export const ApiGetAllDrops = () =>
  applyDecorators(
    ApiOperation({ summary: 'Get all drops with optional filters' }),
    ApiOkResponse({
      description: 'List of drops',
      type: GetAllDropsResponseDto,
    }),
  );
