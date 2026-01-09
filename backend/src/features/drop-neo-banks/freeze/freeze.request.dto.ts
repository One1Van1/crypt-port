import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class FreezeDropNeoBankRequestDto {
  @ApiProperty({ description: 'Frozen amount in ARS', example: 150000, minimum: 0 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  frozenAmount: number;
}
