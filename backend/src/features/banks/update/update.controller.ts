import { Controller, Patch, Param, Body, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UpdateBankService } from './update.service';
import { UpdateBankRequestDto } from './update.request.dto';
import { UpdateBankResponseDto } from './update.response.dto';
import { ApiUpdateBank } from './openapi.decorator';

@Controller('banks')
@ApiTags('Banks')
export class UpdateBankController {
  constructor(private readonly service: UpdateBankService) {}

  @Patch(':id')
  @ApiUpdateBank()
  async handle(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateBankRequestDto,
  ): Promise<UpdateBankResponseDto> {
    return this.service.execute(id, dto);
  }
}
