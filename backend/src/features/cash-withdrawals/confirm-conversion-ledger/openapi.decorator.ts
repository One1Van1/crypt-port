import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { ApiRolesAccess } from '../../../common/decorators/api-roles.decorator';
import { UserRole } from '../../../common/enums/user.enum';
import { ConfirmConversionLedgerResponseDto } from './confirm-conversion-ledger.response.dto';

export const ApiConfirmConversionLedger = () =>
  applyDecorators(
    ApiOperation({
      summary: '🟣 [ADMIN] Confirm peso→USDT conversion and emit Free USDT entry',
      description:
        'Sets conversion status to CONFIRMED (if not already) and creates a Free USDT ledger entry linked to the conversion (idempotent).',
    }),
    ApiBearerAuth(),
    ApiRolesAccess(UserRole.ADMIN),
    ApiOkResponse({ type: ConfirmConversionLedgerResponseDto }),
  );
