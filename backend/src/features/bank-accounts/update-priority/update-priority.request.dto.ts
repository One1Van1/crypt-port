import { IsNumber, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateBankAccountPriorityRequestDto {
  @ApiProperty({
    description: 'Priority (lower number = higher priority, from 1 to 99)',
    example: 1,
    minimum: 1,
    maximum: 99,
  })
  @IsNumber()
  @Min(1)
  @Max(99)
  priority: number;
}
