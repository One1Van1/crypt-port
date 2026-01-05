import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiOkResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { GetAllConversionsResponseDto } from './get-all-conversions.response.dto';

export const ApiGetAllConversions = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Get all peso to USDT conversions',
      description: 'Retrieve all conversion records with user information',
    }),
    ApiOkResponse({
      description: 'List of conversions retrieved successfully',
      type: GetAllConversionsResponseDto,
    }),
    ApiUnauthorizedResponse({
      description: 'Unauthorized - Admin or Teamlead role required',
    }),
  );
