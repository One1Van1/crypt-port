import { Controller, Delete, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { DeletePlatformService } from './delete.service';
import { ApiDeletePlatform } from './openapi.decorator';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/enums/user.enum';

@Controller('platforms')
@ApiTags('Platforms')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class DeletePlatformController {
  constructor(private readonly service: DeletePlatformService) {}

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiDeletePlatform()
  async handle(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.service.execute(id);
  }
}
