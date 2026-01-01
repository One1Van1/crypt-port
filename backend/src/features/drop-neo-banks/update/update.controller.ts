import { Controller, Patch, Param, Body, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { UpdateDropNeoBankService } from './update.service';
import { UpdateDropNeoBankRequestDto } from './update.request.dto';
import { DropNeoBank } from '../../../entities/drop-neo-bank.entity';

@Controller('drop-neo-banks')
@ApiTags('DropNeoBanks')
export class UpdateDropNeoBankController {
  constructor(private readonly service: UpdateDropNeoBankService) {}

  @Patch(':id')
  @ApiOperation({ summary: 'Update drop neo bank' })
  @ApiOkResponse({ type: DropNeoBank })
  async handle(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDropNeoBankRequestDto,
  ): Promise<DropNeoBank> {
    return this.service.execute(id, dto);
  }
}
