import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { UserRole } from '../../../common/enums/user.enum';
import { User } from '../../../entities/user.entity';
import { ApiGetMyRecentTransactions } from './openapi.decorator';
import { GetMyRecentTransactionsQueryDto } from './get-my-recent.query.dto';
import { GetMyRecentTransactionsService } from './get-my-recent.service';
import { GetMyRecentTransactionsResponseDto } from './get-my-recent.response.dto';

@Controller('transactions')
@ApiTags('GetMyRecentTransactions')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class GetMyRecentTransactionsController {
  constructor(private readonly service: GetMyRecentTransactionsService) {}

  @Get('my-recent')
  @Roles(UserRole.OPERATOR, UserRole.ADMIN, UserRole.TEAMLEAD)
  @ApiGetMyRecentTransactions()
  async handle(
    @CurrentUser() user: User,
    @Query() query: GetMyRecentTransactionsQueryDto,
  ): Promise<GetMyRecentTransactionsResponseDto> {
    return this.service.execute(user, query);
  }
}
