import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class GetReservationStatusV3QueryDto {
  @ApiProperty({ description: 'Bank account id', example: 123 })
  @Type(() => Number)
  @IsNumber()
  bankAccountId: number;
}
