import { Controller, Get, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { GetPlatformByIdService } from './get-by-id.service';
import { GetPlatformByIdResponseDto } from './get-by-id.response.dto';
import { ApiGetPlatformById } from './openapi.decorator';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';

@Controller('platforms')
@ApiTags('Platforms')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class GetPlatformByIdController {
  constructor(private readonly service: GetPlatformByIdService) {}

  @Get(':id')
  @ApiGetPlatformById()
  async handle(@Param('id', ParseIntPipe) id: number): Promise<GetPlatformByIdResponseDto> {
    return this.service.execute(id);
  }
}
