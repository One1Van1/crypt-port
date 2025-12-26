import { Controller, Get, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { GetTransactionByIdService } from './get-by-id.service';
import { GetTransactionByIdResponseDto } from './get-by-id.response.dto';
import { ApiGetTransactionById } from './openapi.decorator';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/enums/user.enum';

@Controller('transactions')
@ApiTags('Transactions')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class GetTransactionByIdController {
  constructor(private readonly service: GetTransactionByIdService) {}

  @Get('by-id/:id')
  @Roles(UserRole.ADMIN, UserRole.TEAMLEAD)
  @ApiGetTransactionById()
  async handle(@Param('id', ParseIntPipe) id: number): Promise<GetTransactionByIdResponseDto> {
    return this.service.execute(id);
  }
}
