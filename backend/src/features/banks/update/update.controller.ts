import { Controller, Patch, Param, Body, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { UpdateBankService } from './update.service';
import { UpdateBankRequestDto } from './update.request.dto';
import { UpdateBankResponseDto } from './update.response.dto';
import { ApiUpdateBank } from './openapi.decorator';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/enums/user.enum';

@Controller('banks')
@ApiTags('Banks')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UpdateBankController {
  constructor(private readonly service: UpdateBankService) {}

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiUpdateBank()
  async handle(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateBankRequestDto,
  ): Promise<UpdateBankResponseDto> {
    return this.service.execute(id, dto);
  }
}
