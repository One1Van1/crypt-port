import { Body, Controller, Param, ParseIntPipe, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/enums/user.enum';
import { UpdateWithdrawnAmountRequestDto } from './update-withdrawn-amount.request.dto';
import { UpdateWithdrawnAmountResponseDto } from './update-withdrawn-amount.response.dto';
import { UpdateWithdrawnAmountService } from './update-withdrawn-amount.service';
import { ApiUpdateWithdrawnAmount } from './openapi.decorator';

@Controller('bank-accounts')
@ApiTags('BankAccounts')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UpdateWithdrawnAmountController {
  constructor(private readonly service: UpdateWithdrawnAmountService) {}

  @Patch(':id/withdrawn-amount')
  @Roles(UserRole.ADMIN)
  @ApiUpdateWithdrawnAmount()
  async handle(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateWithdrawnAmountRequestDto,
  ): Promise<UpdateWithdrawnAmountResponseDto> {
    return this.service.execute(id, dto);
  }
}
