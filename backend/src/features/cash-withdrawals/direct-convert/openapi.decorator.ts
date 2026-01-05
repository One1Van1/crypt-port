import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiOkResponse, ApiBadRequestResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { DirectConvertResponseDto } from './direct-convert.response.dto';

export const ApiDirectConvert = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Direct conversion of pesos to USDT',
      description: 'Create a direct peso to USDT conversion record without linking to specific cash withdrawal',
    }),
    ApiOkResponse({
      description: 'Conversion created successfully',
      type: DirectConvertResponseDto,
    }),
    ApiBadRequestResponse({
      description: 'Invalid input data',
    }),
    ApiUnauthorizedResponse({
      description: 'Unauthorized - Admin or Teamlead role required',
    }),
  );
