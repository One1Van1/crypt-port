import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { GetAllBanksResponseDto } from './get-all.response.dto';

export const ApiGetAllBanks = () =>
  applyDecorators(
    ApiOperation({ summary: 'Get all banks with optional filters' }),
    ApiOkResponse({
      description: 'List of banks',
      type: GetAllBanksResponseDto,
    }),
  );
