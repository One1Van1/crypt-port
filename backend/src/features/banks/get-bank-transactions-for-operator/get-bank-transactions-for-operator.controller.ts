import { Controller, Get, Param, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { GetBankTransactionsForOperatorService } from './get-bank-transactions-for-operator.service';
import { GetBankTransactionsForOperatorQueryDto } from './get-bank-transactions-for-operator.query.dto';
import { GetBankTransactionsForOperatorResponseDto } from './get-bank-transactions-for-operator.response.dto';
import { ApiGetBankTransactionsForOperator } from './openapi.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { User } from '../../../entities/user.entity';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/enums/user.enum';

@Controller('banks')
@ApiTags('GetBankTransactionsForOperator')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class GetBankTransactionsForOperatorController {
  constructor(private readonly service: GetBankTransactionsForOperatorService) {}

  @Get(':bankId/transactions/operator')
  @Roles(UserRole.OPERATOR, UserRole.TEAMLEAD, UserRole.ADMIN)
  @ApiGetBankTransactionsForOperator()
  async handle(
    @Param('bankId', ParseIntPipe) bankId: number,
    @Query() query: GetBankTransactionsForOperatorQueryDto,
    @CurrentUser() user: User,
  ): Promise<GetBankTransactionsForOperatorResponseDto> {
    return this.service.execute(bankId, user.id, query);
  }
}
