import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { GetMyTransactionsService } from './get-my.service';
import { GetMyTransactionsQueryDto } from './get-my.query.dto';
import { GetMyTransactionsResponseDto } from './get-my.response.dto';
import { ApiGetMyTransactions } from './openapi.decorator';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { UserRole } from '../../../common/enums/user.enum';
import { User } from '../../../entities/user.entity';

@Controller('transactions')
@ApiTags('Transactions')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class GetMyTransactionsController {
  constructor(private readonly service: GetMyTransactionsService) {}

  @Get('my')
  @Roles(UserRole.OPERATOR)
  @ApiGetMyTransactions()
  async handle(
    @Query() query: GetMyTransactionsQueryDto,
    @CurrentUser() user: User,
  ): Promise<GetMyTransactionsResponseDto> {
    return this.service.execute(query, user);
  }
}
