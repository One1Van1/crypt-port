import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiOkResponse, ApiQuery } from '@nestjs/swagger';
import { GetAllDropNeoBanksResponseDto } from './get-all.response.dto';
import { NeoBankStatus } from '../../../common/enums/neo-bank.enum';

export const ApiGetAllDropNeoBanks = () =>
  applyDecorators(
    ApiOperation({ summary: 'Get all drop neo banks with filters' }),
    ApiOkResponse({ type: GetAllDropNeoBanksResponseDto }),
    ApiQuery({ name: 'dropId', required: false, type: Number }),
    ApiQuery({ name: 'provider', required: false, type: String, description: 'Provider (free-text bank name)' }),
    ApiQuery({ name: 'status', required: false, enum: NeoBankStatus }),
  );
