import { Controller, Delete, Param, ParseIntPipe, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/enums/user.enum';
import { DeleteBankService } from './delete.service';
import { ApiDeleteBank } from './openapi.decorator';

@Controller('banks')
@ApiTags('Banks')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class DeleteBankController {
  constructor(private readonly service: DeleteBankService) {}

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(UserRole.ADMIN)
  @ApiDeleteBank()
  async handle(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.service.execute(id);
  }
}
