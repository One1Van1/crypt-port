import { Controller, Delete, Param, ParseIntPipe, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiNoContentResponse } from '@nestjs/swagger';
import { DeleteDropNeoBankService } from './delete.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/enums/user.enum';

@Controller('drop-neo-banks')
@ApiTags('DropNeoBanks')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DeleteDropNeoBankController {
  constructor(private readonly service: DeleteDropNeoBankService) {}

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete drop neo bank (soft delete)' })
  @ApiNoContentResponse({ description: 'Successfully deleted' })
  async handle(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.service.execute(id);
  }
}
