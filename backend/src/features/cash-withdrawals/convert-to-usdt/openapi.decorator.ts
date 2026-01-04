import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiOkResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { ConvertToUsdtResponseDto } from './convert-to-usdt.response.dto';

export const ApiConvertToUsdt = () =>
  applyDecorators(
    ApiOperation({ summary: 'Convert withdrawn cash to USDT (Admin/TeamLead)' }),
    ApiParam({ name: 'id', description: 'Cash withdrawal ID' }),
    ApiOkResponse({ type: ConvertToUsdtResponseDto }),
    ApiBearerAuth(),
  );
