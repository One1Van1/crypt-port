import { Controller, Get, Param, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { GetDropTransactionsForOperatorService } from './get-drop-transactions-for-operator.service';
import { GetDropTransactionsForOperatorQueryDto } from './get-drop-transactions-for-operator.query.dto';
import { GetDropTransactionsForOperatorResponseDto } from './get-drop-transactions-for-operator.response.dto';
import { ApiGetDropTransactionsForOperator } from './openapi.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { User } from '../../../entities/user.entity';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/enums/user.enum';

@Controller('drops')
@ApiTags('GetDropTransactionsForOperator')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class GetDropTransactionsForOperatorController {
  constructor(private readonly service: GetDropTransactionsForOperatorService) {}

  @Get(':dropId/transactions/operator')
  @Roles(UserRole.OPERATOR, UserRole.TEAMLEAD, UserRole.ADMIN)
  @ApiGetDropTransactionsForOperator()
  async handle(
    @Param('dropId', ParseIntPipe) dropId: number,
    @Query() query: GetDropTransactionsForOperatorQueryDto,
    @CurrentUser() user: User,
  ): Promise<GetDropTransactionsForOperatorResponseDto> {
    return this.service.execute(dropId, user.id, query);
  }
}
