import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { GetAllTransactionsService } from './get-all.service';
import { GetAllTransactionsQueryDto } from './get-all.query.dto';
import { GetAllTransactionsResponseDto } from './get-all.response.dto';
import { ApiGetAllTransactions } from './openapi.decorator';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/enums/user.enum';

@Controller('transactions')
@ApiTags('Transactions')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class GetAllTransactionsController {
  constructor(private readonly service: GetAllTransactionsService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.TEAMLEAD)
  @ApiGetAllTransactions()
  async handle(@Query() query: GetAllTransactionsQueryDto): Promise<GetAllTransactionsResponseDto> {
    return this.service.execute(query);
  }
}
