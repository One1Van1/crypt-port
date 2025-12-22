import { Controller, Patch, Param, Body, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UpdateBankStatusService } from './update-status.service';
import { UpdateBankStatusRequestDto } from './update-status.request.dto';
import { UpdateBankStatusResponseDto } from './update-status.response.dto';
import { ApiUpdateBankStatus } from './openapi.decorator';

@Controller('banks')
@ApiTags('Banks')
export class UpdateBankStatusController {
  constructor(private readonly service: UpdateBankStatusService) {}

  @Patch(':id/status')
  @ApiUpdateBankStatus()
  async handle(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateBankStatusRequestDto,
  ): Promise<UpdateBankStatusResponseDto> {
    return this.service.execute(id, dto);
  }
}
