import { Controller, Get, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/enums/user.enum';
import { ApiGetTransactionByIdV2 } from './openapi.decorator';
import { TransactionV2ItemDto } from '../get-all-v2/get-all-v2.response.dto';
import { GetTransactionByIdV2Service } from './get-by-id-v2.service';

@Controller('transactions')
@ApiTags('GetTransactionByIdV2')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class GetTransactionByIdV2Controller {
  constructor(private readonly service: GetTransactionByIdV2Service) {}

  @Get('by-id-v2/:id')
  @Roles(UserRole.ADMIN, UserRole.TEAMLEAD)
  @ApiGetTransactionByIdV2()
  async handle(@Param('id', ParseIntPipe) id: number): Promise<TransactionV2ItemDto> {
    return this.service.execute(id);
  }
}
