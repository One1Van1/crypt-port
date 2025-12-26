import { Controller, Get, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { GetBankByIdService } from './get-by-id.service';
import { GetBankByIdResponseDto } from './get-by-id.response.dto';
import { ApiGetBankById } from './openapi.decorator';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';

@Controller('banks')
@ApiTags('Banks')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class GetBankByIdController {
  constructor(private readonly service: GetBankByIdService) {}

  @Get('by-id/:id')
  @ApiGetBankById()
  async handle(@Param('id', ParseIntPipe) id: number): Promise<GetBankByIdResponseDto> {
    return this.service.execute(id);
  }
}
