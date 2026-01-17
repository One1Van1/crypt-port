import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, Min } from 'class-validator';

export class UpdateWithdrawnAmountRequestDto {
  @ApiProperty({
    description: 'New withdrawn amount in ARS. Must be >= 0 and <= initialLimitAmount.',
    example: 4475015.0,
    minimum: 0,
  })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  withdrawnAmount: number;
}
