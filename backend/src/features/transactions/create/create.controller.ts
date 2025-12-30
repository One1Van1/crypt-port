import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CreateTransactionService } from './create.service';
import { CreateTransactionRequestDto } from './create.request.dto';
import { CreateTransactionResponseDto } from './create.response.dto';
import { ApiCreateTransaction } from './openapi.decorator';
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
export class CreateTransactionController {
  constructor(private readonly service: CreateTransactionService) {}

  @Post()
  @Roles(UserRole.OPERATOR, UserRole.TEAMLEAD, UserRole.ADMIN)
  @ApiCreateTransaction()
  async handle(
    @Body() dto: CreateTransactionRequestDto,
    @CurrentUser() user: User,
  ): Promise<CreateTransactionResponseDto> {
    return this.service.execute(dto, user);
  }
}
