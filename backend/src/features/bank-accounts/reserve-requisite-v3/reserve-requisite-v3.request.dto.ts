import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class ReserveRequisiteV3RequestDto {
  @ApiProperty({ description: 'Target bank account id to reserve', example: 123 })
  @Type(() => Number)
  @IsNumber()
  bankAccountId: number;
}
