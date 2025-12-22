import { Controller, Get, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { GetDropByIdService } from './get-by-id.service';
import { GetDropByIdResponseDto } from './get-by-id.response.dto';
import { ApiGetDropById } from './openapi.decorator';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';

@Controller('drops')
@ApiTags('Drops')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class GetDropByIdController {
  constructor(private readonly service: GetDropByIdService) {}

  @Get(':id')
  @ApiGetDropById()
  async handle(@Param('id', ParseIntPipe) id: number): Promise<GetDropByIdResponseDto> {
    return this.service.execute(id);
  }
}
