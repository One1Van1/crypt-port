import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { GetMyTransactionsService } from './get-my-transactions.service';
import { GetMyTransactionsQueryDto } from './get-my-transactions.query.dto';
import { GetMyTransactionsResponseDto } from './get-my-transactions.response.dto';
import { ApiGetMyTransactions } from './openapi.decorator';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/enums/user.enum';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { User } from '../../../entities/user.entity';

@Controller('transactions')
@ApiTags('GetMyTransactions')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class GetMyTransactionsController {
  constructor(private readonly service: GetMyTransactionsService) {}

  @Get('my-transactions')
  @Roles(UserRole.OPERATOR)
  @ApiGetMyTransactions()
  async handle(
    @CurrentUser() user: User,
    @Query() query: GetMyTransactionsQueryDto,
  ): Promise<GetMyTransactionsResponseDto> {
    return this.service.execute(user, query);
  }
}
