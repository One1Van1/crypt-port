import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiOkResponse, ApiNotFoundResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { ConfirmConversionResponseDto } from './confirm-conversion.response.dto';

export const ApiConfirmConversion = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Confirm peso to USDT conversion',
      description: 'Admin confirms that USDT has been received (changes status from pending to confirmed)',
    }),
    ApiOkResponse({
      description: 'Conversion confirmed successfully',
      type: ConfirmConversionResponseDto,
    }),
    ApiNotFoundResponse({
      description: 'Conversion not found',
    }),
    ApiUnauthorizedResponse({
      description: 'Unauthorized - Admin role required',
    }),
  );
