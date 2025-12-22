import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { DropStatus } from '../../../common/enums/drop.enum';

export class UpdateDropStatusRequestDto {
  @ApiProperty({
    enum: DropStatus,
    enumName: 'DropStatus',
    description: 'New drop status',
    example: DropStatus.ACTIVE,
  })
  @IsEnum(DropStatus)
  status: DropStatus;
}
