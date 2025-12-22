import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiOkResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { RefreshResponseDto } from './refresh.response.dto';

export const ApiRefresh = () =>
  applyDecorators(
    ApiOperation({
      summary: '⚪ [ANY] Refresh access token',
      description: 'Get new access and refresh tokens using refresh token',
    }),
    ApiOkResponse({
      description: 'Tokens refreshed successfully',
      type: RefreshResponseDto,
    }),
    ApiUnauthorizedResponse({
      description: 'Invalid or expired refresh token',
    }),
  );
