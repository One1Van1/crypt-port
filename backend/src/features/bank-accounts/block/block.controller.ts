import { Controller, Patch, Param, Body, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { BlockBankAccountService } from './block.service';
import { BlockBankAccountRequestDto } from './block.request.dto';
import { BlockBankAccountResponseDto } from './block.response.dto';
import { ApiBlockBankAccount } from './openapi.decorator';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/enums/user.enum';

@Controller('bank-accounts')
@ApiTags('BankAccounts')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class BlockBankAccountController {
  constructor(private readonly service: BlockBankAccountService) {}

  @Patch(':id/block')
  @Roles(UserRole.ADMIN, UserRole.TEAMLEAD)
  @ApiBlockBankAccount()
  async handle(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: BlockBankAccountRequestDto,
  ): Promise<BlockBankAccountResponseDto> {
    return this.service.execute(id, dto);
  }
}
